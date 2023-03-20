# from context import BASEDIR
import os, json, time, argparse, shutil
from pywinauto.application import Application
from pywinauto.keyboard import send_keys
from client.pdfform import config_win
from client.pdfform.application_form import ApplicationForm
from client.pdfform.form_controls_win import Skip
from pathlib import Path
from base.utils.client.utils import append_ext
from client.system.config import console

# Get project's home directory,
BASEDIR = os.path.abspath(os.path.dirname(__file__))
# All data directory
PDFDIR = os.path.abspath(os.path.join(BASEDIR, "pdfform/pdfs"))


def check_env():
    if not os.path.isfile(config_win.ACROBAT_READER_PATH):
        print("Acrobat reader not found. Please install it first.")
        exit()


def prepare_document(form_type: str, name: str):
    """Create a new empty pdf file to fill"""

    # copy empty template file to output folder
    src = Path(PDFDIR + f"/{form_type}.pdf")
    dst = Path(".").cwd() / f"{name}"
    shutil.copy2(src, dst)

    # open file with acrobat reader
    app = Application(backend="uia").start(
        str(config_win.ACROBAT_READER_PATH) + " " + str(dst)
    )

    time.sleep(1)
    doc = Application(backend="uia").connect(path=config_win.ACROBAT_READER_PATH)
    retry = 20
    active_windows = doc.windows()
    while len(active_windows) == 0 and retry > 0:
        time.sleep(1)
        retry -= 1
        print(retry)
        active_windows = doc.windows()
    if retry == 0:
        print("Time out")
        exit()


def finish_document():
    """Validate, save and close document"""

    send_keys("^S")  # Ctrl + S to save
    send_keys("^W")  # Ctrl + W to close


def get_args():
    """Get command-line arguments"""

    parser = argparse.ArgumentParser(
        description="PDF Filler -- automatically fill application forms.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )

    parser.add_argument("json_name", help="Input json filename")

    parser.add_argument(
        "-o",
        "--output",
        help="Output file name. ",
        metavar="output_file_name",
        default="test",
    )

    parser.add_argument(
        "-v", "--verbose", help="verbose output filling steps", action="store_true"
    )
    args = parser.parse_args()
    json_name = args.json_name.split(".")[0]
    args.output = append_ext(json_name, ".pdf")
    args.json_name = append_ext(args.json_name, ".json")

    return args


def main():
    """main function"""

    args = get_args()
    # open actions data
    try:
        with open(args.json_name, "r", encoding="utf-8") as f:
            actions = json.load(f)
    except FileNotFoundError as e:
        console.print(e, style="red")
    else:
        form_dict = actions.pop(0)  # first element is form type statement
        if form_dict.get("action_type") != "Check":
            raise ValueError(
                "The json file is out of date. Please use latest imm pdfform to generate."
            )
        form_name = form_dict.get("form")

        in_file = str(Path(args.json_name))
        verbose = args.verbose
        out_file = str(Path(".").cwd() / args.output)

        check_env()
        prepare_document(form_name, out_file)

        form = ApplicationForm(verbose=verbose)

        for action in actions:
            form.add_step(action)

        form.fill_form(0, verbose=verbose)
        finish_document()


if __name__ == "__main__":
    main()
