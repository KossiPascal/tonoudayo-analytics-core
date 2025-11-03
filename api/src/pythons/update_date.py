import requests
import json
from datetime import datetime, timedelta

# CouchDB connection details
COUCHDB_URL = "http://localhost:5984"  # Change to your CouchDB URL
DB_NAME = "medic"  # The database name

# Function to convert Excel-style date to proper date format
def convert_excel_date(excel_date):
    try:
        # Excel-style date: 1 = 1900-01-01, so we start from there
        base_date = datetime(1900, 1, 1)
        # Subtract 2 because Excel counts 1900 as a leap year, which is incorrect
        # So, we subtract 2 to align with the real calendar
        return (base_date + timedelta(days=excel_date - 2)).strftime("%d/%m/%Y")
    except Exception as e:
        print(f"Error converting date: {e}")
        return None

# Connect to CouchDB and get the documents
def update_dates_in_couchdb():
    # URL for the database
    db_url = f"{COUCHDB_URL}/{DB_NAME}/_all_docs?include_docs=true"

    # Fetch all documents from the CouchDB database
    response = requests.get(db_url)
    if response.status_code == 200:
        data = response.json()
        
        # Iterate through each document
        for row in data['rows']:
            doc = row['doc']
            doc_id = doc['_id']
            doc_rev = doc['_rev']
            
            # If the next_visit field exists, update it
            if 'next_visit' in doc.get('fields', {}):
                original_date = doc['fields']['next_visit']
                
                # Check if next_visit is an integer (Excel-style date)
                if original_date.isdigit():
                    excel_date = int(original_date)
                    new_date = convert_excel_date(excel_date)
                else:
                    new_date = original_date  # In case it's already in the correct format
                    
                if new_date:
                    # Update the "next_visit" field with the formatted date
                    doc['fields']['next_visit'] = new_date
                    
                    # Send the updated document back to CouchDB
                    update_url = f"{COUCHDB_URL}/{DB_NAME}/{doc_id}"
                    update_data = json.dumps({"_rev": doc_rev, "fields": doc['fields']})
                    headers = {"Content-Type": "application/json"}
                    update_response = requests.put(update_url, data=update_data, headers=headers)
                    
                    if update_response.status_code == 201:
                        print(f"Updated document {doc_id} with next_visit: {new_date}")
                    else:
                        print(f"Failed to update document {doc_id}: {update_response.text}")
    else:
        print(f"Failed to fetch documents: {response.status_code} - {response.text}")

# Run the update process
if __name__ == "__main__":
    update_dates_in_couchdb()
