from pathlib import PureWindowsPath
import os, dotenv

path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))
config = dotenv.dotenv_values(path)

adobe_path = config.get("adobe_reader_path")
ACROBAT_READER_PATH = PureWindowsPath(adobe_path)
