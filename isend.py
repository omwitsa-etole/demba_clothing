from intasend import APIService
import os

API_BASE = "https://sandbox.intasend.com/"


token = 'ISSecretKey_test_8bd4113d-853b-400d-b303-e51cb06cc008'#os.getenv("I_TOKEN")
publishable_key = 'ISPubKey_test_b09c268f-62ed-4e5e-ad0b-7ec9b55d7212'#os.getenv("I_KEY")

service = None

def auth():
    global service
    service = APIService(token=token, publishable_key=publishable_key, test=True)

async def stk():
    
    response = service.collect.mpesa_stk_push(phone_number=ph,
                                  email=em, amount=amt, narrative=desc)
    print(response)
    return response

async def status(iid):
    response = service.collect.status(invoice_id=iid)
    print(response)
    return response

async def get_url(phone,email,amount,desc,md):
    try:
        print(phone,email,amount,desc)
        response = service.collect.checkout(phone_number=phone,method= md,api_ref=desc,
                                        email=email, amount=amount, currency="KES", comment="Payment for Order: "+desc, redirect_url="https://demba-clothing.com/order/success/"+desc)
        print(response)
        return response.get("url")
    except Exception as e:
        print(str(e))
    return "https://demba-clothing.com/track/"+desc
