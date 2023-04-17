# This app is developed for daily pdf manupilation
import pikepdf
from pdf2image import convert_from_path
from glob import glob
import argparse, os, img2pdf, shutil
from PIL import Image
from datetime import datetime
import argparse
from client.system.config import console

# convert img to pdf
def convertImg2Pdf(img_path):
    image = Image.open(img_path)
    pdf_bytes = img2pdf.convert(image.filename)
    pdf_path = img_path.split(".")[0] + ".pdf"
    file = open(pdf_path, "wb")
    file.write(pdf_bytes)
    image.close()
    file.close()
    console.print(
        f"Successfully coverted {img_path} to pdf file {pdf_path}", style="green"
    )


def batchCovertImg2Pdf(input):
    imgs = sorted(glob(input))
    for img in imgs:
        convertImg2Pdf(img)


def convert2img(pdfFile, folder="./", dpi=70):
    pages = convert_from_path(pdfFile, dpi)
    print(pdfFile)
    imgFileName = pdfFile.split("/")[-1]
    print("imgFilename is ", imgFileName)
    i = 0
    for page in pages:
        fn = folder + imgFileName + "{0:03}".format(i) + ".jpg"
        page.save(fn, "JPEG")
        i += 1
    console.print(f"Successfully converted pdf to {i} images...", style="green")


def pdf2pdf(pdfFile, outputFile=None, dpi=70):
    # make a temp folder
    now = datetime.now()
    tmpFolder = (
        str(now.year)
        + str(now.month)
        + str(now.day)
        + str(now.hour)
        + str(now.minute)
        + str(now.second)
    )
    os.mkdir(tmpFolder)
    # convert to imgs
    convert2img(pdfFile, tmpFolder + "/", dpi)
    # convert imgs to pdfs
    imgs = sorted(glob(tmpFolder + "/*.jpg"))
    for img in imgs:
        convertImg2Pdf(img)
    # delete all imgs
    remove = "rm " + tmpFolder + "/*.jpg"
    os.system(remove)
    # merge pdfs to pdf
    targetName = outputFile or pdfFile.split(".")[0] + "_flatterned" + ".pdf"
    merge(tmpFolder + "/*.pdf", targetName)
    # delete tmp folder
    shutil.rmtree(tmpFolder)
    console.print(f"{pdfFile} has been flatterned to {targetName}...", style="green")


def split_pdf(fileName):
    pdf = pikepdf.Pdf.open(fileName)
    outputName = fileName.split(".")[0]
    for n, page in enumerate(pdf.pages):
        dst = pikepdf.Pdf.new()
        dst.pages.append(page)
        dst.save(outputName + f"{n:03d}.pdf")
    pages = len(pdf.pages)
    console.print(f"Successfully splitted {fileName} to {pages} pdf.", style="green")


def merge_pdf(input, targetName):
    if type(input) == str:
        files = sorted(glob(input))
    elif type(input) == list:
        files = input
    else:
        files = None
        console.print(
            "Input source error! it must be either filter string or a file list...",
            style="reg",
        )
        return
    pdf = pikepdf.Pdf.new()
    version = pdf.pdf_version
    for file in files:
        src = pikepdf.Pdf.open(file)
        version = max(version, src.pdf_version)
        pdf.pages.extend(src.pages)
    pdf.remove_unreferenced_resources()
    pdf.save(targetName)
    fileNumber = len(files)
    console.print(
        f"Successfully merged {fileNumber} files to {targetName}.", style="green"
    )


def reverse_pdf(fileName):
    pdf = pikepdf.Pdf.open(fileName, allow_overwriting_input=True)
    pdf.pages.reverse()
    pdf.save()
    pages = len(pdf.pages)
    console.print(f"Successfully reversed {pages}.", style="green")


def append_pdf(source, target):
    pdf_source = pikepdf.Pdf.open(source)
    pdf_target = pikepdf.Pdf.open(target, allow_overwriting_input=True)
    pdf_target.pages.extend(pdf_source.pages)
    pdf_target.save()
    pages = len(pdf_source.pages)
    console.print(
        f"Successfully appended {pages} pages from {source} to {target}.", style="green"
    )


# copy source pages from start page to end page to an existing file, or to append to a new file
def insert_pdf(source, target, startPage=0, endPage=-1, position=0):
    pdf_source = pikepdf.Pdf.open(source)
    if int(endPage) > len(pdf_source.pages):
        console.print(
            f"The end page {endPage} is bigger than the total pages {len(pdf_source.pages)}",
            style="red",
        )
        return
    fileExist = os.path.isfile(target)
    if fileExist:
        pdf_target, position = (
            pikepdf.Pdf.open(target, allow_overwriting_input=True),
            position,
        )
    else:
        pdf_target, position = pikepdf.Pdf.new(), 0

    if int(position) > len(pdf_target.pages):
        console.print(
            f"The position {position+1} is bigger than the total pages {len(pdf_target.pages)}",
            style="red",
        )
        return
    pages = 0
    initial_position = int(position)
    position = int(position)
    for page in range(int(startPage), int(endPage)):
        pdf_target.pages.insert(position, pdf_source.pages[page])
        position += 1
        pages += 1
    console.print(
        f"Total {pages} pages inserted to position from {initial_position} to {position}.",
        style="green",
    )
    pdf_target.save() if fileExist else pdf_target.save(target)


def delete_pdf(fileName, start, end):
    pdf = pikepdf.Pdf.open(fileName, allow_overwriting_input=True)
    for page in range(int(end) - int(start) + 1):
        del pdf.pages[end - page - 1]
    pdf.save()
    console.print(
        f"Successfully deleted {end-start} pages from {start} to {end}\nNow {fileName} has {len(pdf.pages)} pages left.",
        style="green",
    )


def main():


    parser = argparse.ArgumentParser(description='PDF manipulation tool')

    # Define arguments and options
    parser.add_argument('-s', '--source', required=True, help='Source pdf')
    parser.add_argument('-t', '--to', required=True, help='Target pdf')
    parser.add_argument('-f', '--filename-filter', help='Filter to select pdf')
    parser.add_argument('-l', '--filename-list', help='List of pdf')
    parser.add_argument('-r', '--reverse', action='store_true', help='Reverse pdf')
    parser.add_argument('-i', '--arg-insert', required=True, help='Insert pdf')
    parser.add_argument('-d', '--arg-delete', required=True, help='Delete pages')
    parser.add_argument('-bip', '--batchimg2pdf', required=True, help='Get picture selection by using filter (exp: "*.jpg". "" is must!)')
    parser.add_argument('-pi', '--pdf2img', required=True, help='Pdf to imgs')
    parser.add_argument('-sp', '--start-page', type=int, default=0, help='Start page')
    parser.add_argument('-ep', '--end-page', type=int, default=1, help='End page')
    parser.add_argument('-p', '--position', type=int, default=0, help='End page')
    parser.add_argument('-dpi', type=int, default=70, help='DPI')

    args = parser.parse_args()

    def split():
        """
        Split a pdf file to separate pages
        """
        split_pdf(args.source)

    def merge():
        """
        Merge pdfs selected by filter or directly input pdf file list
        """
        if args.filename_filter:
            merge_pdf(args.filename_filter, args.to)
        elif args.filename_list:
            merge_pdf(args.filename_list, args.to)
        else:
            print("You must either input filename_filter or filename_list")

    def append():
        """
        Append source pdf to target pdf
        """
        append_pdf(args.source, args.to)

    def insert():
        """
        Insert pages from source pdf to target pdf
        """
        start = int(args.insert[1]) - 1
        end = int(args.insert[2])
        position = int(args.to[1]) - 1 if len(args.to) > 1 else 0
        insert(args.insert[0], args.to[0], start, end, position)

    def delete():
        """
        Delete pages from start page to end page in a pdf
        """
        delete(args.source, args.start_page, args.end_page)

    def i2p():
        """
        Convert one image to pdf
        """
        convertImg2Pdf(args.source)

    def bi2p():
        """
        Convert batch images selected by filter to pdf
        """
        batchCovertImg2Pdf(args.batchimg2pdf)

    def p2i():
        """
        Convert pdf to images
        """
        convert2img(args.source)

    def p2p():
        """
        Change pdf dpi
        """
        pdf2pdf(args.source, args.to, dpi=args.dpi)

    if args.arg_delete:
        delete()
    elif args.batchimg2pdf:
        bi2p()
    elif args.filename_filter or args.filename_list:
        merge()
    elif args.arg_insert:
        insert()
    elif args.pdf2img:
        p2i()
    elif args.to:
        append()
    else:
        split()



if __name__ == "__main__":
    main()
