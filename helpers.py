# < (c) @xditya >
# Keep credits, if using.

import redis
import os
import logging


def connect_redis(URL, PASSWORD, PORT):
    return redis.Redis(
        host=URL,
        port=PORT,
        password=PASSWORD,
        decode_responses=True,
    )


def get_redis(redis_url, redis_pass):
    if redis_url and redis_pass is None:
        var = ""
        for i in os.environ:
            if i.startswith("QOVERY_REDIS_") and i.endswith("_PORT"):
                var = i
        if var:
            try:
                hash = var.split("QOVERY_REDIS_")[1].split("_")[0]
                endpoint = os.environ[f"QOVERY_REDIS_{hash}_HOST"]
                port = os.environ[f"QOVERY_REDIS_{hash}_PORT"]
                passw = os.environ[f"QOVERY_REDIS_{hash}_PASSWORD"]
            except KeyError:
                logging.info("Redis Vars are missing. Quitting.")
                exit(1)
            except Exception as er:
                logging.info(er)
                exit(1)
            redis_db = connect_redis(endpoint, passw, port)
    else:
        try:
            endpoint, port = redis_url.split(":")
        except Exception as e:
            logging.info(e)
            exit(1)
        redis_db = connect_redis(endpoint, redis_pass, port)
    return redis_db
