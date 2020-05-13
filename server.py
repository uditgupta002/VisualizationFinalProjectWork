"""
Main file to run the server program.
"""

import os
import logging
from flask import Flask

import routes

app = Flask(__name__)
app.register_blueprint(routes.routes)

if __name__ == "__main__":
    parent_dir = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))
    project_path = os.path.dirname(os.path.realpath(__file__))
    log_file_location = os.path.join(project_path, 'logs', 'log.txt')
    logger = logging.basicConfig(filename=log_file_location,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        datefmt='%d-%b-%y %H:%M:%S',
        level=logging.DEBUG)
    routes.init()
    app.run()
