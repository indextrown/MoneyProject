import upbit_module
from dotenv import load_dotenv
import os

# load .env
load_dotenv()

# Access Key
Access_Key = os.environ.get('Access_Key')

# Secret Key
Secret_Key = os.environ.get('Secret_Key')

upbit_module.get_balance_info(Access_Key, Secret_Key)