from base.source.excel import Excel
from base.source.upgrade import upgrade
import argparse, json
from functools import reduce
from base.utils.client.utils import append_ext, get_immenv_value
from client.system.config import (
    console,
    error_style,
    success_style,
)
import getpass


def main():
    args = get_args()
    args = add_ext(args)
    protection = False if args.protection_off else True

    if args.command.lower() in ["a", "add"]:
        if len(args.other_excels) < 1:
            raise ValueError("Must more than one excel files after for add operation ")
        output_fn = args.to or args.source_excel
        try:
            excel_objs = list(
                map(lambda x: Excel(x), [args.source_excel, *args.other_excels])
            )
            e = reduce(lambda a, b: a + b, excel_objs)
            password = get_password()
            e.make_excel(output_fn, protection=protection, password=password)
            console.print(f"{output_fn} saved", style=success_style)
        except Exception as e:
            console.print(f"{str(e)}", "red", style=error_style)
        return

    if args.command.lower() in ["s", "sub"]:
        if len(args.other_excels) < 1:
            raise ValueError("Must more than one excel files after sub operation ")
        output_fn = args.to or args.source_excel
        try:
            excel_objs = list(
                map(lambda x: Excel(x), [args.source_excel, *args.other_excels])
            )
            e = reduce(lambda a, b: a - b, excel_objs)
            password = get_password()
            e.make_excel(output_fn, protection=protection, password=password)
            console.print(f"{output_fn} saved", style=success_style)

        except Exception as e:
            console.print("{str(e)}", style=error_style)
        return

    if args.command.lower() in ["c", "copy"]:
        target_name = (
            args.to or args.source_excel
        )  # if without -t filename, use first file as the target file name
        if len(args.other_excels) < 1:
            raise ValueError("Must  more than one excel files after copy operation ")
        try:
            excel_objs = list(
                map(lambda x: Excel(x), [args.source_excel, *args.other_excels])
            )
            e = reduce(lambda a, b: a.copy(b), excel_objs)
            password = get_password()
            e.make_excel(target_name, protection=protection, password=password)
            console.print(f"{target_name} saved", style=success_style)
        except Exception as e:
            console.print(f"{str(e)}", style=error_style)

        return

    if args.command.lower() in ["j", "json"]:
        if args.to:
            excel = Excel(args.excel)
            with open(args.to, "w") as fp:
                json.dump(excel.dict, fp, indent=3, default=str)
            console.print("{args.to} is saved", style=success_style)
            return
        else:
            excel = Excel(args.source_excel)
            data = json.dumps(excel.dict, indent=3, default=str)
            print(data)

    """ Translation """
    if args.command.lower() in ["t", "translate"]:
        excel = Excel(args.source_excel)

        output_fn = args.to or args.source_excel

        protection = False if args.protection_off else True
        password = get_password()

        # check if translate the display or value
        if args.display:
            language = get_language_code(args.language)

            new_excel = excel.make_another_language_version(target_language=language)
            new_excel.make_excel(output_fn, protection=protection, password=password)

            console.print(
                f"{args.source_excel} has been translated to {args.language.title()} version, and saved as {output_fn}",
                style=success_style,
            )
        else:
            new_excel = excel.translate_values(target_language="en")
            new_excel.make_excel(output_fn, protection=protection, password=password)
            console.print(
                f"The values of {args.source_excel} have been translated to English, and saved as {output_fn}",
                style=success_style,
            )


""" Get password"""


def get_password():
    password = get_immenv_value("EXCEL_PASSWORD")
    if not password:
        password = getpass.getpass("Enter your password: ")
    return password


""" Get language code"""


def get_language_code(language):
    language = language.lower()
    lang_map = {
        "chinese": "zh",
        "english": "en",
        "hindi": "hi",
        "korean": "ko",
    }
    return lang_map.get(language, language)


def add_ext(args):
    if args.source_excel:
        args.source_excel = append_ext(args.source_excel, ".xlsx")
    if args.other_excels:
        args.other_excels = append_ext(args.other_excels, ".xlsx")
    if args.to and args.command.lower() in ["j", "json"]:
        args.to = append_ext(args.to, ".json")
    elif args.to:
        args.to = append_ext(args.to, ".xlsx")

    return args


def get_args():
    parser = argparse.ArgumentParser(
        description="For munipulate excel and get data source... '.xlsx' is default and don't need to input"
    )

    parser.add_argument(
        "command",
        help="Command for add, sub, copy, or get data source. You can input 'a' or 'add' for add, 's' or 'sub' for sub, 'c' or 'copy' for copy, 'j' or 'json' for get json data, 't' or 'translate' for traslate excel to another language",
    )

    parser.add_argument("source_excel", help="Source excel name")
    parser.add_argument(
        "other_excels", help="Excel names ONLY used for add, sub, or copy", nargs="*"
    )

    parser.add_argument(
        "-t",
        "--to",
        help="it is Output file name or dictory, if not input, the add, sub,or copy's first filename will be used as default.",
    )

    parser.add_argument(
        "-l",
        "--language",
        help="Specify the target language to translate. Used together with -d.  Default is Chinese.",
        default="zh",
    )

    parser.add_argument(
        "-d",
        "--display",
        help="Specify  to translate excel display contents, including titles and descriptions",
        action="store_true",
    )

    parser.add_argument(
        "-po",
        "--protection_off",
        help="Protection off. default is On",
        action="store_true",
    )

    args = parser.parse_args()

    return args


if __name__ == "__main__":
    main()
