import os
import http.server
import ssl
from subprocess import call

# সার্টিফিকেট জেনারেট করার জন্য OpenSSL কমান্ড (যদি উইন্ডোজে থাকে) অথবা পাইথন দিয়ে ডামি ফাইল তৈরি
cert_file = "cert.pem"
key_file = "key.pem"

if not os.path.exists(cert_file) or not os.path.exists(key_file):
    print("Generating self-signed SSL certificate...")
    # উইন্ডোজ/সব প্ল্যাটফর্মে কাজ করার জন্য ডামি সার্টিফিকেট ক্রিয়েট (অথবা আপনি চাইলে সরাসরি ওপেনএসএসএল ব্যবহার করতে পারেন)
    # তবে সবচেয়ে নিরাপদ উপায় হলো একটি সহজ স্ক্রিপ্ট দিয়ে রান করা
    os.system(f'openssl req -new -x509 -keyout {key_file} -out {cert_file} -days 365 -nodes -subj "/C=US/ST=Local/L=Local/O=Local/CN=localhost"')

# যদি আপনার পিসিতে openssl কমান্ড না থাকে, তবে নিচের কোডটি একটি পিওর পাইথন HTTPS সার্ভার চালাবে
server_address = ('0.0.0.0', 8000)
httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
try:
    context.load_cert_chain(certfile=cert_file, keyfile=key_file)
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    print("Serving HTTPS on https://192.168.0.195:8000 ...")
    httpd.serve_forever()
except Exception as e:
    print(f"SSL setup failed: {e}")
    print("\n[Alternative Option] পাইথনের কোড দিয়ে ওপেনএসএসএল ঝামেলা মনে হলে, আপনার আগের কমান্ড প্রম্পটেই Ngrok ব্যবহার করুন।")