import os
from whoosh.index import create_in, open_dir
from whoosh.fields import *
from whoosh.qparser import QueryParser
from translator import translate
from content_noc21 import DETAILS_NOC21

# Define the schema for the index
schema = Schema(
    noc_code=TEXT(stored=True),
    title=TEXT(stored=True),
    title_examples=TEXT(stored=True),
    main_duties=TEXT(stored=True),
)

# Create a new index directory or open an existing one
if not os.path.exists("text_noc_index"):
    os.mkdir("text_noc_index")
    ix = create_in("text_noc_index", schema)
else:
    ix = open_dir("text_noc_index")

# Define the data that you want to index

nocs=[]
metadatas=[]
for k,v in DETAILS_NOC21.items():
    noc={
        "noc_code":k,
        "title":v["title"],
        "title_examples":"\n".join(v["title_examples"]),
        "main_duties":"\n".join(v["main_duties"])
    }
    nocs.append(noc)
    
# Add the data to the index
writer = ix.writer()
for item in nocs:
    writer.add_document(**item)
writer.commit()