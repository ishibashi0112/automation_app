from dataclasses import dataclass
from email.header import Header
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import smtplib


@dataclass
class StmpMailer:
    host: str
    port: int
    account: str
    password: str

    def __post_init__(self):
        self.msg = MIMEMultipart() 

    def set_send_to(self, from_address: str, to_address: str,  cc_address: str = "", subject: str = "" ) -> None:
        self.msg['From'] =  from_address
        self.msg['Cc'] = cc_address
        self.msg['To'] = to_address 
        self.msg['Subject'] = Header(subject)
    
    def set_body(self, body: str) -> None:
        self.msg.attach(MIMEText(body, 'plain'))


    # ※fileはpath指定、もしくは直接bytesを渡す。
    def attach_file(self, file: str | bytes, file_name: str  ) -> None:
        attachment: MIMEApplication 
        if isinstance(file, str):
            attachment = MIMEApplication(open(file, "rb").read())
        else:
            attachment =MIMEApplication(file)

        attachment.add_header("Content-Disposition", "attachment", filename=file_name)
        self.msg.attach(attachment)
    
    def send_email(self) -> None:
        print(self.host, self.port)
        server = smtplib.SMTP(self.host, self.port)
        server.ehlo()
        server.starttls()
        server.ehlo()
        print("kokokokok")
        server.login(self.account, self.password)
        print("test")
        server.send_message(self.msg)
        print("testtest")
        server.quit()