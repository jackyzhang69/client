import os, certifi,dotenv
from pymongo import MongoClient
from typing import List
from datetime import datetime

# get imm system's env variables
path = os.path.abspath(os.path.join(os.path.expanduser("~"), ".immenv"))
config = dotenv.dotenv_values(path)
# load env variables if a .env file exists
dotenv.load_dotenv(path)

# Mongodb
account = os.getenv("MongoDBUser")
password = os.getenv("MongoDBPassword")
connection = f"mongodb+srv://{account}:{password}@noah.yi5fo.mongodb.net/test?retryWrites=true&w=majority"
client = MongoClient(connection, tlsCAFile=certifi.where())
database = "test"
db = client[database]


class Collection:
    def __init__(self, collection: str):
        # Create a new collection called  collection
        self.collection = db[collection]

    def insert_one(self, document: dict):
        # Insert a new document into the  collection
        self.collection.insert_one(document)

    def insert_many(self, documents: List[dict]):
        # Insert a list of documents into the  collection
        self.collection.insert_many(documents)

    def find_all(self):
        # Find all documents in the  collection
        return list(self.collection.find({}))

    def find_one(self, selector: dict):
        # Find one document in the  collection
        return self.collection.find_one(selector)

    def find_many(self, selector: dict):
        # Find many  document in the  collection
        return self.collection.find(selector)

    def update_one(self, selector: dict, document: dict):
        # Update a document in the "users" collection
        self.collection.update_one(selector, {"$set": document})

    def replace_one(self, selector: dict, document: dict):
        # Replace a document in the "users" collection
        self.collection.replace_one(selector, document)

    def delete_one(self, selector: dict):
        # Delete a document from the "users" collection
        self.collection.delete_one(selector)

    def delete_many(self, selector: dict):
        self.collection.delete_many(selector)

    # Check if a data record existed
    def is_existed(self, selector: dict):
        result = self.collection.find(selector)
        obj_list = [r for r in result]
        return bool(obj_list)

    # Get the latest date in the collection
    def get_latest_date(self, selector, date_field):
        count = db.ita.count_documents(selector)
        if count == 0:
            latest_ita_date = "1970-01-01"
        else:
            latest_ita_date = (
                self.collection.find(selector)
                .sort(date_field, -1)
                .limit(1)[0][date_field]
            )
        return datetime.strptime(latest_ita_date, "%Y-%m-%d").date()
