import random
import requests
import json
import smtplib, ssl
import os
import sys
from flask import Flask, request,make_response  ,session,render_template,jsonify,send_from_directory
import os
from flask_cors import CORS
import httpx

import json

app = Flask(__name__)

app.secret_key = 'ussd'
#app. = True
#app.secret_key = 'ussd'
API_URL = "https://office.demba-clothing.com"#"https://e6f4-102-2-132-28.ngrok-free.app"#"http://localhost:64634"

ALL_FEED = []
ALL_PRODUCT = []
ALL_BANNER = []
CURRENT_USER = "CurrentUser" 
CART_ITEMS = 0
ITEMS_CART = []
CORS(app)



@app.before_request
async def before_request_func():
    global CART_ITEMS
    if session.get("manifest") == None:
        session["manifest"] = {
            'title': "Demba Clothing",
            'cart_items':CART_ITEMS
        }
    #else:

async def fetch_cart():
    global CART_ITEMS
    global ITEMS_CART
    u = API_URL+"/api/cart/view?user="+CURRENT_USER
    headers = {
        'Content-Type': 'application/json'
    }
    items = []
    total = 0
    try:
        rsession = requests.Session()
        response = rsession.post(u,headers=headers)
        if response.status_code == 200:
            data = response.json()
            items = data.get("Items")
            total = data.get("Total")
    except Exception as e:
        print(str(e))
        pass
    print("cart=>",items)
    ITEMS_CART = items
    CART_ITEMS = len(items)


async def fetch_order(num):
    global CART_ITEMS
    global ITEMS_CART
    u = API_URL+"/api/cart/order?user="+CURRENT_USER+"&number="+num
    headers = {
        'Content-Type': 'application/json'
    }
    items = None
    total = 0
    try:
        rsession = requests.Session()
        response = rsession.post(u,headers=headers)
        if response.status_code == 200:
            data = response.json()
            items = data.get("Order")
            total = data.get("Total")
    except Exception as e:
        print(str(e))
        pass
    print("order=>",items)
    return items

async def fetch_data():
    u = API_URL+"/Home/ApiIndex"
    
    headers = {
        
    }
    feed = []
    banner = []
    product = []
    global ALL_BANNER
    global ALL_FEED
    global ALL_PRODUCT
    try:
        response = requests.post(u,headers=headers)
        #print(response.status_code)
        if response.status_code == 200:
            data = response.json()
            print("data=>",data)
            success = data.get("success", False)
            feed = data.get("feed")
            product = data.get("products")
            banner = data.get("banners")
    except Exception as e:
        print("error",e)
    if feed:
        ALL_FEED += [f for f in feed if f not in ALL_FEED]

    if product:
        ALL_PRODUCT += [f for f in product if f not in ALL_PRODUCT]

    if banner:
        ALL_BANNER += [f for f in banner if f not in ALL_BANNER]

@app.route('/static/<path:filename>')
def static_sample(filename):
    static_dir = os.path.join(app.root_path, 'static')
    return send_from_directory(static_dir, filename)


@app.route("/api/cart/resendemail",methods=["POST"])
@app.route("/cart/resendemail",methods=["POST"])
def resendemail():
    num = request.args.get("number")
    u = API_URL+"/api/cart/resendemail?number="+num
    headers = {
        'Content-Type': 'application/json'
    }
    try:
        response = requests.post(u,headers=headers)
        #print(response.status_code)
        if response.status_code == 200:
            data = response.json()
            return jsonify(data)
    except Exception as e:
        print(str(e))
        pass
    return jsonify({'Success':False})

@app.route("/api/add-to-cart/<string:id>")
def add_cart(id):
    print("adding",id)
    u = API_URL+"/api/cart/add?user="+CURRENT_USER
    name = request.args.get("name")
    qnty = request.args.get("qnty") 
    sale = request.args.get("sale") 
    img = request.args.get("imgurl")
    price = request.args.get("price")
    stock = request.args.get("stock")
    headers = {
        'Content-Type': 'application/json'
    }
    try:
        rsession = requests.Session()

        data = {'Name': name,'Qnty':qnty,'Price':price,'Sale':sale,'Id':int(id),'Image_Url':img,'Stock':stock}
        global CART_ITEMS
        response = rsession.post(u,headers=headers,data=json.dumps(data))
        if response.status_code == 200:
            data = response.json()
            print("data",data.get("Items"))
            CART_ITEMS = int(data.get("Items"))
            return jsonify(data)
    except Exception as e:
        print(str(e))
        pass


    return jsonify({'Success':False,'Response':response.status_code})

@app.route("/")
def landing():
    global CART_ITEMS
    return render_template("index.html",manifest=session["manifest"])

@app.route("/login")
def login():
    return render_template("login.html")
    
@app.route("/signup")
def signup():
    return render_template("login.html")
    
@app.route("/cart/")
@app.route("/cart")
async def cart():
    global CART_ITEMS
    global ITEMS_CART
    await fetch_cart()
    if 'manifest' not in session:
        session['manifest'] = {}
    session["manifest"]["cart_items"] = CART_ITEMS
    return render_template("cart.html",manifest=session["manifest"],Items=ITEMS_CART,Total=0,API_URL=API_URL)

@app.route("/shop")
async def shop():
    global ALL_PRODUCT
    
    if len(ALL_PRODUCT) == 0:
        await fetch_data()
    print("product",ALL_PRODUCT)
    # [{'Id': 3, 'Title': 'DENIM JACKET', 'Material': None, 'Price': 2580, 'Sale': 12, 'Brand_Id': 3, 'Brand': 'OTHERS', 'Series': '28', 'Category': 'DENIM JACKET', 'SubCategory': 'HEAVY DENIM', 'Level': 'MEDIUM', 'EDetail': 'BEAUTIFUL DENIM JACKET',
    # 'Stock': '3', 'RelDate': '/Date(1745096400000)/', 'image_Url': '/ImagesData/CameraImages/638807485157737314_1.png'}]
    return render_template("shop.html",products=ALL_PRODUCT,API_URL=API_URL,manifest=session["manifest"])

@app.route("/feed")
async def feed():
    
    global ALL_BANNER
    global ALL_FEED
    global ALL_PRODUCT  
    await fetch_data()
   

    print("Feed=>",ALL_FEED)
    return render_template("feed.html",feed=ALL_FEED,API_URL=API_URL,manifest=session["manifest"])

     #[{'Id': 1, 'Caption': 'Mas', 'Banner_Url': '/ImagesData/MainPageBanners/denim_full.png638815101281727486_1.png', 'Timestamp': '/Date(1745902528173)/'}, {'Id': 2, 'Caption': '', 'Banner_Url': '/ImagesData/MainPageBanners/2024_08_26_09_15_IMG_3505.JPG638815472860811741_1.JPG', 'Timestamp': '/Date(1745939686080)/'}, {'Id': 3, 'Caption': '', 'Banner_Url': '/ImagesData/MainPageBanners/2024_08_26_09_19_IMG_3510.JPG638815473531698146_1.JPG', 'Timestamp': '/Date(1745939753170)/'}]

@app.route("/contact")
def contact():
    return render_template("contact.html",manifest=session["manifest"])


@app.route("/product/<string:id>/")
def product(id):
    u = API_URL+"/api/cart/product?pid="+id
    headers = {
        'Content-Type': 'application/json'
    }
    product = None
    related = []
    rsession = requests.Session()
    response = rsession.post(u,headers=headers)
    if response.status_code == 200:
        data = response.json()
        product = data.get("Product")
        related = data.get("Others")
    print("prduct=>",related)
    # {'Id': 3, 'Title': 'DENIM JACKET', 'Stock': 3, 
    #'Brand': {'Id': 3, 'Name': 'OTHERS', 'Brand_Image': '/ImagesData/MainPageBanners/others.png638807481921931380_1.png'}, 
    #'Size': 28, 'Category': {'Id': 1, 'Name': 'DENIM JACKET', 'Category_Image': '/ImagesData/MainPageBanners/denim_jacket.png638807386439292131_1.png'}, 'SubCategory': {'Id': 2, 'Name': 'HEAVY DENIM', 'Category_Id': 1}, 'Level': 'MEDIUM', 'Price': 2580.0, 'Sale': 12.0,
    # 'Material': None, 'MegaPixel': '0', 'SensorFormat': '', 'EDetail': 'BEAUTIFUL DENIM JACKET', 'truck': False, 'bike': False, 'person': False, 'collect': True, 'Description': 'brown demin jacket. medium sized', 'AnnounceDate': '2025-04-20T00:00:00', 
    #'Images': 
    #[{'Id': 1, 'Caption': 'denim_jacket.png', 'Image_Url': '/ImagesData/CameraImages/638807485157737314_1.png'}]}
    return render_template("product.html",manifest=session["manifest"],Product=product,Related = related,API_URL=API_URL)

@app.route("/product_category/<string:id>/")
def category(id):
    return render_template("product.html",manifest=session["manifest"],API_URL=API_URL)

#@app.route("")
@app.route("/checkout/",methods=["POST","GET"])
@app.route("/checkout",methods=["POST","GET"])
async def checkout():
    global ITEMS_CART
    if len(ITEMS_CART) == 0:
        await fetch_cart()
    u = API_URL+"/api/cart/checkout?user="+CURRENT_USER
    print("cart",ITEMS_CART)
    total = 0
    for i in ITEMS_CART:
        total += i['Payable']
    if request.args.get("number"):
        num = request.args.get("number")
        order = await fetch_order(num)
        print("order fetch=>",order)
        return render_template("confirmorder.html",manifest=session["manifest"],API_URL=API_URL,Order=order,Total=total,EMAIL=order["Email"])    
    if request.method == "POST":
        email = request.form["billing_email"]
        names = request.form["billing_first_name"]+" "+request.form["billing_last_name"]
        faddr = request.form["billing_address_1"]+" - "+request.form["billing_address_2"]
        desc = "Country: "+request.form["billing_country"]+"\n Town: "+request.form["billing_city"]+"\nMethod:"+request.form["payment_method"]+"\nCode: "+request.form["billing_postcode"]
        phone = request.form["billing_phone"]
        headers = {
            'Content-Type': 'application/json'
        }
        rsession = requests.Session()

        # Optionally: manually set a cookie if you know it
        #session.cookies.set('ASP.NET_SessionId', CURRENT_USER)  # optional
        #if request.method == "POST":
        #    name = request.form["name"]
        data = {'Name': names,'Email':email,'FullAddress':faddr,'Description':desc,'Phone':phone}
        #global CART_ITEMS
        print("data",data)
        try:
            response = rsession.post(u,headers=headers,data=json.dumps(data))
            if response.status_code == 200:
                data = response.json()
                if data.get("Success") == True:
                    order = data.get("Order")
                    print("order=>",order)
                    return render_template("confirmorder.html",manifest=session["manifest"],API_URL=API_URL,Order=data.get("Order"),Total=data.get("Total"),EMAIL=email)    
        except Exception as e:
            print(str(e))
            pass
    return render_template("checkout.html",manifest=session["manifest"],API_URL=API_URL,ITEMS=ITEMS_CART,Total=total)



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8041))
    app.run(host="0.0.0.0", port=port,debug=True )