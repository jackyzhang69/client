
from email.mime.text import MIMEText
import smtplib,os
from dataclasses import dataclass
from typing import List


""" My email dataclass"""
@dataclass
class EmailReceiver:
    to_email:str
    salution:str="Hello,<br>"
    
@dataclass
class EmailBody:
    subject:str
    header:str="Here is the latest update on the program news you subscribed:<br>"
    message:str=""
    footer:str="<br>Regards,<br><br>Jacky Zhang<br>MBA / RCIC / Software Developer<br>"
    
""" Send emails to a list of email receivers"""    
def send_emails(to_list:List[EmailReceiver], email_body:EmailBody):
    sender = "noah.consultant@outlook.com"
    password = os.environ.get("EMAIL_PASSWORD")
    smtp_server = "smtp-mail.outlook.com"
    smtp_port = 587 # default SMTP port for Outlook
    body=email_body.header+email_body.message+email_body.footer
    

    try:
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.ehlo()
        server.starttls()
        server.login(sender, password)
        for to in to_list:
            msg = MIMEText(to.salution+"<br>"+body, 'html')
            msg['Subject'] = email_body.subject
            msg['From'] = sender
            msg['To'] = to.to_email
            server.send_message(msg)
        
    except Exception as e:
        print("Error: ", e)
    finally:
        server.quit()
        print("Emails sent successfully")


""" Make a html table from a 2D list """
def html_table(dict_list,title=""):
    html = "<html><head>"
    html += "<link rel='stylesheet' href='https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css' integrity='sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm' crossorigin='anonymous'>"
    html += "</head><body>"
    html += f"""<h3 class="text-center">{title}</h3>"""
    html += "<div class='container'>"
    html_table = "<table class='table'>"
    html_table += "<thead><tr>"
    # Loop through first row of input list to create table headers
    for title in dict_list[0]:
        html_table += f"<th>{title}</th>"
    html_table += "</tr></thead>"
    html_table += "<tbody>"
    # Loop through rest of input list to create table rows
    for row in dict_list[1:]:
        html_table += "<tr>"
        for key in row:
            html_table += f"<td>{key}</td>"
        html_table += "</tr>"
    html_table += "</tbody></table>"
    html += html_table
    html += "</div></body></html>"
    
    return html
