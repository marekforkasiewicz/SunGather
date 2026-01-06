from http.server import BaseHTTPRequestHandler, HTTPServer
from threading import Thread
from version import __version__
from urllib.parse import parse_qs, urlparse

import json
import logging
import urllib
import time
from datetime import datetime

class export_webserver(object):
    html_body = "Pending Data Retrieval"
    metrics = ""
    health_data = {
        "status": "initializing",
        "uptime_start": time.time(),
        "last_scrape_time": None,
        "last_scrape_success": False,
        "total_registers": 0,
        "inverter_connected": False
    }
    
    def __init__(self):
        False

    # Configure Webserver
    def configure(self, config, inverter):
        try:
            self.webServer = HTTPServer(('', config.get('port',8080)), MyServer)
            self.t = Thread(target=self.webServer.serve_forever)
            self.t.daemon = True    # Make it a deamon, so if main loop ends the webserver dies
            self.t.start()
            export_webserver.health_data["status"] = "healthy"
            logging.info(f"Webserver: Configured")
        except Exception as err:
            export_webserver.health_data["status"] = "unhealthy"
            logging.error(f"Webserver: Error: {err}")
            return False
        pending_config = False
        config_body = f"""
            <h3>SunGather v{__version__}</h3></p>
            <h4>Configuration changes require a restart to take effect!</h4>    
            <form action="/config">
            <label>Inverter Settings:</label><br>
            <table><tr><th>Option</th><th>Setting</th><th>Update?</th></tr>
            """
        for setting, value in inverter.client_config.items():
            config_body += f'<tr><td><label for="{str(setting)}">{str(setting)}:</label></td>'
            config_body += f'<td><input type="text" id="{str(setting)}" name="{str(setting)}" value="{str(value)}"></td>'
            config_body += f'<td><input type="checkbox" id="update_{str(setting)}" name="update_{str(setting)}" value="False"></td></tr>'
        for setting, value in inverter.inverter_config.items():
            config_body += f'<tr><td><label for="{str(setting)}">{str(setting)}:</label></td>'
            config_body += f'<td><input type="text" id="{str(setting)}" name="{str(setting)}" value="{str(value)}"></td>'
            config_body += f'<td><input type="checkbox" id="update_{str(setting)}" name="update_{str(setting)}" value="False"></td></tr>' 
        #config_body += f'</table><input type="submit" value="Submit"></form>'
        config_body += f'</table>Currently ReadOnly, No save function yet :(</form>'
        export_webserver.config = config_body

        return True

    def publish(self, inverter):
        json_array={"registers":{}, "client_config":{}, "inverter_config":{}}
        metrics_body = ""
        main_body = f"""
            <h3>SunGather v{__version__}</h3></p>
            <h4>Need Help? <href a='https://github.com/bohdan-s/SunGather'>https://github.com/bohdan-s/SunGather</a></h4></p>
            <h4>NEW HomeAssistant Add-on: <href a='https://github.com/bohdan-s/hassio-repository'>https://github.com/bohdan-s/SunGather</a></h4></p>
            """
        main_body += "<table><th>Address</th><tr><th>Register</th><th>Value</th></tr>"
        for register, value in inverter.latest_scrape.items():
            main_body += f"<tr><td>{str(inverter.getRegisterAddress(register))}</td><td>{str(register)}</td><td>{str(value)} {str(inverter.getRegisterUnit(register))}</td></tr>"
            metrics_body += f"{str(register)}{{address=\"{str(inverter.getRegisterAddress(register))}\", unit=\"{str(inverter.getRegisterUnit(register))}\"}} {str(value)}\n"
            json_array["registers"][str(inverter.getRegisterAddress(register))]={"register": str(register), "value":str(value), "unit": str(inverter.getRegisterUnit(register))}
        main_body += f"</table><p>Total {len(inverter.latest_scrape)} registers"

        main_body += "</p></p><table><tr><th>Configuration</th><th>Value</th></tr>"
        for setting, value in inverter.client_config.items():
            main_body += f"<tr><td>{str(setting)}</td><td>{str(value)}</td></tr>"
            json_array["client_config"][str(setting)]=str(value)
        for setting, value in inverter.inverter_config.items():
            main_body += f"<tr><td>{str(setting)}</td><td>{str(value)}</td></tr>"
            json_array["inverter_config"][str(setting)]=str(value)
        main_body += f"</table></p>"

        export_webserver.main = main_body
        export_webserver.metrics = metrics_body
        export_webserver.json = json.dumps(json_array)
        
        # Update health data
        export_webserver.health_data["last_scrape_time"] = datetime.now().isoformat()
        export_webserver.health_data["last_scrape_success"] = True
        export_webserver.health_data["total_registers"] = len(inverter.latest_scrape)
        export_webserver.health_data["inverter_connected"] = True
        
        return True

class MyServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/health/detailed'):
            # Detailed health check with full status information
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            
            uptime_seconds = int(time.time() - export_webserver.health_data["uptime_start"])
            
            health_response = {
                "status": export_webserver.health_data["status"],
                "version": __version__,
                "uptime_seconds": uptime_seconds,
                "uptime_human": self._format_uptime(uptime_seconds),
                "last_scrape_time": export_webserver.health_data["last_scrape_time"],
                "last_scrape_success": export_webserver.health_data["last_scrape_success"],
                "total_registers": export_webserver.health_data["total_registers"],
                "inverter_connected": export_webserver.health_data["inverter_connected"],
                "timestamp": datetime.now().isoformat()
            }
            
            self.wfile.write(bytes(json.dumps(health_response, indent=2), "utf-8"))
            
        elif self.path.startswith('/health'):
            # Simple health check - just HTTP 200 if healthy
            status = export_webserver.health_data["status"]
            if status == "healthy":
                self.send_response(200)
            elif status == "degraded":
                self.send_response(503)  # Service Unavailable
            else:
                self.send_response(503)
                
            self.send_header("Content-type", "application/json")
            self.end_headers()
            
            simple_response = {
                "status": status,
                "version": __version__
            }
            
            self.wfile.write(bytes(json.dumps(simple_response), "utf-8"))
            
        elif self.path.startswith('/metrics'):
            self.send_response(200)
            self.send_header("Content-type", "text/plain")
            self.end_headers()
            self.wfile.write(bytes(export_webserver.metrics, "utf-8"))
        elif self.path.startswith('/config'):
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(bytes(export_webserver.config, "utf-8"))
            parsed_data = parse_qs(urlparse(self.path).query)
            logging.info(f"{parsed_data}")
        elif self.path.startswith('/json'):
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.end_headers()
            self.wfile.write(bytes(export_webserver.json, "utf-8"))
        else:
            self.send_response(200)
            self.send_header("Content-type", "text/html")
            self.end_headers()
            self.wfile.write(bytes("<html><head><title>SunGather</title>", "utf-8"))
            self.wfile.write(bytes("<meta charset='UTF-8'><meta http-equiv='refresh' content='15'>", "utf-8"))
            self.wfile.write(bytes('<style media = "all"> body { background-color: black; color: white; } @media screen and (prefers-color-scheme: light) { body { background-color: white; color: black; } } </style>', "utf-8"))
            self.wfile.write(bytes("</head>", "utf-8"))
            self.wfile.write(bytes("<body>", "utf-8"))
            self.wfile.write(bytes(export_webserver.main, "utf-8"))
            self.wfile.write(bytes("</table>", "utf-8"))
            self.wfile.write(bytes("</body></html>", "utf-8"))

    def do_POST(self):
        length = int(self.headers['Content-Length'])
        post_data = urllib.parse.parse_qs(self.rfile.read(length).decode('utf-8'))
        logging.info(f"{post_data}")
        self.wfile.write(post_data.encode("utf-8"))

    def log_message(self, format, *args):
        pass
    
    def _format_uptime(self, seconds):
        """Format uptime in human readable format"""
        days = seconds // 86400
        hours = (seconds % 86400) // 3600
        minutes = (seconds % 3600) // 60
        secs = seconds % 60
        
        parts = []
        if days > 0:
            parts.append(f"{days}d")
        if hours > 0:
            parts.append(f"{hours}h")
        if minutes > 0:
            parts.append(f"{minutes}m")
        if secs > 0 or not parts:
            parts.append(f"{secs}s")
            
        return " ".join(parts)
