import random
import requests
import json
import smtplib, ssl
import os
import sys
from flask import Flask, request,make_response,send_file ,url_for ,Response,session,render_template,jsonify,send_from_directory,redirect
import os
from flask_cors import CORS
import httpx
import isend as isp
import json
import getpass
import socket
import hashlib
from datetime import datetime

# Combine username and hostname
user = getpass.getuser()
host = socket.gethostname()

# Create a short hash
raw_id = f"{user}@{host}"
short_id = hashlib.sha256(raw_id.encode()).hexdigest()[:8]  # 8-char unique ID

CURRENT_USER = short_id

app = Flask(__name__)

app.secret_key = 'ussd'
#app. = True
#app.secret_key = 'ussd'
API_URL = "https://estore.etoletools.online"#"https://e6f4-102-2-132-28.ngrok-free.app"#"http://localhost:64634"

ALL_FEED = []
ALL_PRODUCT = []
ALL_CATEGORY = []
ALL_SUB_CATEGORY = []
ALL_BANNER = []
#CURRENT_USER = "CurrentUser" 
CART_ITEMS = 0
ITEMS_CART = []
CORS(app)

@app.route("/robots.txt")
def robots():
    content = "User-agent: *\nAllow: *\n"
    return Response(content, mimetype="text/plain")

@app.route("/bg/bg.mp4")
def stream_video():
    path = "static/bg.mp4"
    range_header = request.headers.get('Range', None)
    if not os.path.exists(path):
        abort(404)

    if not range_header:
        return send_file(path)

    size = os.path.getsize(path)
    byte1, byte2 = 0, None

    match = range_header.strip().split("=")[-1]
    if "-" in match:
        parts = match.split("-")
        byte1 = int(parts[0])
        if parts[1]:
            byte2 = int(parts[1])

    byte2 = byte2 if byte2 is not None else size - 1
    length = byte2 - byte1 + 1

    with open(path, 'rb') as f:
        f.seek(byte1)
        data = f.read(length)

    rv = Response(data, 206, mimetype="video/mp4", direct_passthrough=True)
    rv.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{size}')
    rv.headers.add('Accept-Ranges', 'bytes')
    rv.headers.add('Content-Length', str(length))
    return rv

@app.route('/static/<path:filename>')
def static_files(filename):
    response = make_response(send_from_directory('static', filename))
    response.headers['Cache-Control'] = 'public, max-age=36000' 
    response.headers['Expires'] = 'Thu, 31 Dec 2025 23:55:55 GMT'
    return response

@app.route("/api/pay/stk",methods=["POST"])
async def pay_stk():
    ph = request.args.get("phone")
    em = request.args.get("email")
    amt = request.args.get("amt")
    desc = request.args.get("desc")
    isp.auth()
    response = await isp.stk(ph,em,amt,desc)
    
    return jsonify(response)

@app.route("/api/pay/status",methods=["POST"])
async def pay_status():
    iid = request.args.get("iid")
    isp.auth()
    response = await isp.status(iid)
    
    return jsonify(response)

EX_RATE = 0.008
@app.before_request
async def before_request_func():
    global CART_ITEMS
    if session.get("manifest") == None:
        cd = get_country_code()
        curr = "KES"
        if cd == "KE":
            rt = 1
        else:
            rt = EX_RATE
            curr = "USD"
        session["manifest"] = {
            'title': "Demba Clothing",
            'cart_items':CART_ITEMS,
            'country':cd,
            "rate":rt,
            "currency":curr
        }
    #if CART_ITEMS == 0 or CART_ITEMS > 0:
    elif session["manifest"].get("rate") == None:
        cd = get_country_code()
        curr = "KES"
        if cd.upper() == "KE":
            rt = 1
        else:
            rt = EX_RATE
            curr = "USD"
        session["manifest"] = {
            'title': "Demba Clothing",
            'cart_items':CART_ITEMS,
            'country':cd,
            "rate":rt,
            "currency":curr
        }
    #else:
    #    #if session["manifest"]["cart_items"] == 0:
    #    #    await fetch_cart()

    session["manifest"]["address"] = "Nairobi, KE"
    session["manifest"]["email"] = "dembaclothing53@gmail.com"
    session["manifest"]["mobile"] = "072657277"
    session["manifest"]["ig"] = "demba_clothing"
    session["manifest"]["yurl"] = "demba_clothing"
    session["manifest"]["yt"] = "dembaclothing"
    session["manifest"]["about"] = """  At Demba Clothing, Happiness is handmade. We craft Unique pieces from upcycled
                            fabrics, blending sustainability with style to create fashion
                            with purpose and heart."""


@app.route("/api/getcountry")
def get_country_code():
    session = None
    ip = request.headers.get('X-Forwarded-For', request.remote_addr)
    if ip == "127.0.0.1":
        return "KES"
    res = requests.get(f'https://ipapi.co/{ip}/country/')
    return res.text

@app.route('/sitemap.xml', methods=['GET'])
def sitemap():
    pages = []

    # Get all the static routes in the Flask app
    for rule in app.url_map.iter_rules():
        if 'GET' in rule.methods and not rule.arguments:
            url = url_for(rule.endpoint, _external=True)
            pages.append([url, datetime.now()])

    # Generate the XML for the sitemap
    sitemap_xml = render_sitemap(pages)

    return Response(sitemap_xml, mimetype='application/xml')


def render_sitemap(pages):
    # Create the XML structure
    sitemap_xml = ['<?xml version="1.0" encoding="UTF-8"?>']
    sitemap_xml.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')

    for page in pages:
        sitemap_xml.append('<url>')
        sitemap_xml.append(f'<loc>{page[0]}</loc>')
        sitemap_xml.append(f'<lastmod>{page[1].strftime("%Y-%m-%dT%H:%M:%S+00:00")}</lastmod>')
        sitemap_xml.append('</url>')

    sitemap_xml.append('</urlset>')

    return '\n'.join(sitemap_xml)




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
        #print(response.status_code,"<=code")
        if response.status_code == 200:
            data = response.json()
            print("cart",data)
            items = data.get("items")
            total = data.get("total")
    except Exception as e:
        print(str(e))
        pass
    #print("cart=>",items)
    ITEMS_CART = items
    CART_ITEMS = len(items)
    if session["manifest"] != None:
        session["manifest"]["cart_items"] = CART_ITEMS


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
            items = data.get("order")
            total = data.get("total")
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
    ctgs = []
    stgs = []
    global ALL_BANNER
    global ALL_FEED
    global ALL_PRODUCT
    global ALL_CATEGORY
    global ALL_SUB_CATEGORY
    try:
        response = requests.post(u,headers=headers)
        #print(response.status_code)
        if response.status_code == 200:
            data = response.json()
            #print("data=>",data)
            success = data.get("success", False)
            feed = data.get("feed")
            product = data.get("products")
            banner = data.get("banners")
            ctgs = data.get("categories")
            sctgs = data.get("subcategories")
    except Exception as e:
        print("error",e)
    if feed:
        ALL_FEED = feed#[f for f in feed if f not in ALL_FEED]

    if product:
        ALL_PRODUCT = product#[f for f in product if f not in ALL_PRODUCT]

    if banner:
        ALL_BANNER = banner#[f for f in banner if f not in ALL_BANNER]
    if ctgs:
        ALL_CATEGORY = ctgs
    if sctgs:
        ALL_SUB_CATEGORY = sctgs
    print("categories",ctgs[:2])

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

@app.route("/api/remove-cart")
def del_cart():
    global CART_ITEMS
    iid = request.args.get("iid")
    u = API_URL+"/api/cart/remove?user="+CURRENT_USER+"&id="+iid
    headers = {
        'Content-Type': 'application/json'
    }
    try:
        rsession = requests.Session()

        data = {}
        
        response = rsession.post(u,headers=headers,data=json.dumps({}))
        if response.status_code == 200:
            data = response.json()
            print("data",data)
            CART_ITEMS = data.get("items")
            if session["manifest"] != None:
                session["manifest"]["cart_items"] = CART_ITEMS
            return jsonify(data)
    except Exception as e:
        print(str(e))
        pass


    return jsonify({'Success':False,'Response':response.status_code})

@app.route("/api/add-to-cart/<string:id>")
def add_cart(id):
    print("adding",id)
    global CART_ITEMS
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
        
        response = rsession.post(u,headers=headers,data=json.dumps(data))
        if response.status_code == 200:
            data = response.json()
            print("data",data)
            CART_ITEMS = data.get("items")
            if session["manifest"] != None:
                session["manifest"]["cart_items"] = CART_ITEMS
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
    ttl = 0
    if 'manifest' not in session:
        session['manifest'] = {}
    #session["manifest"]["cart_items"] = CART_ITEMS
    for i in ITEMS_CART:
        ttl += i['payable']
    return render_template("cart.html",manifest=session["manifest"],Items=ITEMS_CART,Total=ttl,API_URL=API_URL+"/")

@app.route("/shop")
async def shop():
    global ALL_PRODUCT
    
    if len(ALL_PRODUCT) == 0 or request.args.get("refresh") != None:
        await fetch_data()
    #print("product",ALL_PRODUCT)
    # [{'Id': 3, 'Title': 'DENIM JACKET', 'Material': None, 'Price': 2580, 'Sale': 12, 'Brand_Id': 3, 'Brand': 'OTHERS', 'Series': '28', 'Category': 'DENIM JACKET', 'SubCategory': 'HEAVY DENIM', 'Level': 'MEDIUM', 'EDetail': 'BEAUTIFUL DENIM JACKET',
    # 'Stock': '3', 'RelDate': '/Date(1745096400000)/', 'image_Url': '/ImagesData/CameraImages/638807485157737314_1.png'}]
    return render_template("shop.html",products=ALL_PRODUCT,API_URL=API_URL+"/",manifest=session["manifest"])

@app.route("/arrival")
@app.route("/arrivals")
async def arrivals():
    
    global ALL_BANNER
    global ALL_FEED
    global ALL_PRODUCT  
    global ALL_CATEGORY
    global ALL_SUB_CATEGORY
    prds = []
    prds_b = ALL_CATEGORY
    if len(ALL_PRODUCT) == 0:
        await fetch_data()
    for p in ALL_PRODUCT:
        #print(p["relDate"])
        date_str = p["relDate"]
        parsed_date = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S") 
        current_year = datetime.now().year
        if parsed_date.year == current_year:
            prds.append(p)
        elif parsed_date.year == current_year-1:
            prds.append(p)
    print('prod=>',prds_b[:2])
    return render_template("arrival.html",API_URL = API_URL+"/",manifest=session["manifest"],
    CATEGORIES=ALL_CATEGORY,PRODUCTS=prds,PRODUCTS_B=prds_b,FEED=ALL_FEED[:9],
        SUBCATEGORIES = ALL_SUB_CATEGORY
    )

@app.route("/feed")
async def feed():
    
    global ALL_BANNER
    global ALL_FEED
    global ALL_PRODUCT  
    if len(ALL_FEED) == 0:
        await fetch_data()
   

    #print("Feed=>",ALL_FEED)
    return render_template("feed.html",feed=ALL_FEED,API_URL=API_URL+"/",manifest=session["manifest"])

     #[{'Id': 1, 'Caption': 'Mas', 'Banner_Url': '/ImagesData/MainPageBanners/denim_full.png638815101281727486_1.png', 'Timestamp': '/Date(1745902528173)/'}, {'Id': 2, 'Caption': '', 'Banner_Url': '/ImagesData/MainPageBanners/2024_08_26_09_15_IMG_3505.JPG638815472860811741_1.JPG', 'Timestamp': '/Date(1745939686080)/'}, {'Id': 3, 'Caption': '', 'Banner_Url': '/ImagesData/MainPageBanners/2024_08_26_09_19_IMG_3510.JPG638815473531698146_1.JPG', 'Timestamp': '/Date(1745939753170)/'}]

@app.route("/contact")
def contact():
    return render_template("contact.html",manifest=session["manifest"])

@app.route("/search")
@app.route("/search/")
async def search():
    global ALL_PRODUCT
    q = request.args.get("s")
    q = q.strip()
    if len(ALL_PRODUCT) == 0:
        await fetch_data()
    ps = []
    for ap in ALL_PRODUCT:
        if request.args.get("menu") == "true":
            if ap["sensorFormat"].lower() == q.lower():
                ps.append(ap)
                continue
        if any(q.lower() in str(val).lower() for val in ap.values()):
            ps.append(ap)
    return render_template("shop.html",products=ps,API_URL=API_URL+"/",manifest=session["manifest"])


@app.route("/product/<string:id>/")
def product(id):
    u = API_URL+"/api/cart/product?pid="+id
    headers = {
        'Content-Type': 'application/json'
    }
    product = {}
    related = []
    rsession = requests.Session()
    response = rsession.post(u,headers=headers)
    print("u=>",u,response.status_code)
    if response.status_code == 200:
        data = response.json()
        print("product data",data)
        product = data.get("product")
        related = data.get("others")
    print("prduct=>",related)
    # {'Id': 3, 'Title': 'DENIM JACKET', 'Stock': 3, 
    #'Brand': {'Id': 3, 'Name': 'OTHERS', 'Brand_Image': '/ImagesData/MainPageBanners/others.png638807481921931380_1.png'}, 
    #'Size': 28, 'Category': {'Id': 1, 'Name': 'DENIM JACKET', 'Category_Image': '/ImagesData/MainPageBanners/denim_jacket.png638807386439292131_1.png'}, 'SubCategory': {'Id': 2, 'Name': 'HEAVY DENIM', 'Category_Id': 1}, 'Level': 'MEDIUM', 'Price': 2580.0, 'Sale': 12.0,
    # 'Material': None, 'MegaPixel': '0', 'SensorFormat': '', 'EDetail': 'BEAUTIFUL DENIM JACKET', 'truck': False, 'bike': False, 'person': False, 'collect': True, 'Description': 'brown demin jacket. medium sized', 'AnnounceDate': '2025-04-20T00:00:00', 
    #'Images': 
    #[{'Id': 1, 'Caption': 'denim_jacket.png', 'Image_Url': '/ImagesData/CameraImages/638807485157737314_1.png'}]}
    return render_template("product.html",manifest=session["manifest"],Product=product,Related = related,API_URL=API_URL+"/")

@app.route("/product_category/<string:id>/")
def category(id):
    return render_template("product.html",manifest=session["manifest"],API_URL=API_URL+"/")


@app.route("/order/webhook",methods=["GET","POST"])
@app.route("/order/webhook/",methods=["GET","POST"])
def webhook(num):
    
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON"}), 400
        print("data response hook=>",data)
        invoice_id = data.get("invoice_id")
        state = data.get("state")
        account = data.get("account")
        value = data.get("value")
        currency = data.get("currency")
        provider = data.get("provider")
        u = API_URL+"/api/cart/confirm?order="+invoice_id
        payload = {'invoice':invoice_id,'state':state,'email':account,'currency':currency,'amount':value,'provider':provider}

        try:
            response = rsession.post(u,headers=headers,data=json.dumps(payload))
            if response.status_code == 200:
                data = response.json()
                print("data response from server=>",data)
                return jsonify(data)
                #if data.get("success") == True:
                #    #order = data.get("order")
                #    #print("order=>",order)
                #    #return redirect("/checkout?number="+order['orderNumber']+"&method="+request.form["payment_method"])
                #    #return render_template("confirmorder.html",manifest=session["manifest"],API_URL=API_URL+"/",Order=order,Total=data.get("Total"),EMAIL=email)    
        except Exception as e:
            print(str(e))
            pass
@app.route("/order/success/<string:num>",methods=["GET","POST"])
@app.route("/order/success/<string:num>/",methods=["GET","POST"])
async def confirm_order(num):
    print(num)
    #print("detail",)
    u = API_URL+"/api/cart/confirm?order="+num
    order = await fetch_order(num)
    response_ = requests.post("http://82.29.190.14:8001/getMail",headers={},data =json.dumps({'receivers':['omwitsaetole@gmail.com',
        'dembaclothing53@gmail.com','omwitsabradone@gmail.com',order['email']
    ],
    'subject':'Order Payment Success Confirmation - '+order['orderNumber'],'body':'This is a confirmation email for payment made for order '+order['orderNumber']+ "\n."+
    "Contact dembaclothing53@gmail.com for any queries. Thank you.\n"
    }))
    if request.method == "POST":
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid or missing JSON"}), 400

        invoice_id = data.get("invoice_id")
        state = data.get("state")
        account = data.get("account")
        value = data.get("value")
        currency = data.get("currency")
        provider = data.get("provider")
        payload = {'invoice':invoice_id,'state':state,'email':account,'currency':currency,'amount':value,'provider':provider}

        try:
            response = rsession.post(u,headers=headers,data=json.dumps(payload))
            if response.status_code == 200:
                data = response.json()
                print("data res=>",data)
                return jsonify(data)
                #if data.get("success") == True:
                #    #order = data.get("order")
                #    #print("order=>",order)
                #    #return redirect("/checkout?number="+order['orderNumber']+"&method="+request.form["payment_method"])
                #    #return render_template("confirmorder.html",manifest=session["manifest"],API_URL=API_URL+"/",Order=order,Total=data.get("Total"),EMAIL=email)    
        except Exception as e:
            print(str(e))
            pass

@app.route("/track/<string:num>")
async def track(num):
    global ALL_PRODUCT
    u = API_URL+"/api/cart/checkout?num="+num
    order = await fetch_order(num)
    if len(ALL_PRODUCT) == 0:
        await fetch_data()
    return render_template("trackorder.html",Products=ALL_PRODUCT,manifest=session["manifest"],API_URL=API_URL+"/",Order=order,EMAIL=order["email"])    


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
    mthd = "card"
    for i in ITEMS_CART:
        total += i['payable']
    if request.args.get("number"):
        
        if request.args.get("method"):
            mthd = request.args.get("method")
        num = request.args.get("number")
        order = await fetch_order(num)
        #if len(cart) > 0:
        md = "CARD-PAYMENT"
        if mthd != "card":
            md = "MPESA"
        #print("order fetch=>",order)
        isp.auth()
        url = await isp.get_url(order['phone'],order['email'],total,order['orderNumber'],md)
        return render_template("confirmorder.html",manifest=session["manifest"],PAY_URL = url,API_URL=API_URL+"/",Order=order,Total=total,EMAIL=order["email"],Method=mthd)    
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
                print("data res=>",data)
                if data.get("success") == True:
                    order = data.get("order")
                    print("order=>",order)
                    return redirect("/checkout?number="+order['orderNumber']+"&method="+request.form["payment_method"])
                    #return render_template("confirmorder.html",manifest=session["manifest"],API_URL=API_URL+"/",Order=order,Total=data.get("Total"),EMAIL=email)    
        except Exception as e:
            print(str(e))
            pass
    return render_template("checkout.html",manifest=session["manifest"],API_URL=API_URL+"/",ITEMS=ITEMS_CART,Total=total)



if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8041))
    app.run(host="0.0.0.0", port=port,debug=True )