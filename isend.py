from intasend import APIService
import os

API_BASE = "https://sandbox.intasend.com/"


token = 'SSecretKey_live_a7b6105b-7db2-472c-bbc3-43fcfac8628d'#os.getenv("I_TOKEN")
publishable_key = 'ISPubKey_live_744d56eb-ff9b-4054-8fdb-25844b0206b4'#os.getenv("I_KEY")

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

async def get_url(phone,email,amount,desc):
    response = service.collect.checkout(phone_number=phone,method= "CARD-PAYMENT",
                                    email=email, amount=amount, currency="KES", comment="Payment for Order: "+desc, redirect_url="https://demba-clothin.com/order/success/"+desc)
    print(response)
    return response.get("url")
