import json
import os
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


BACKEND_URL = os.environ.get("BACKEND_URL", "http://localhost:5000")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
PASSWORD = os.environ.get("E2E_PASSWORD", "BrainBuzz1!")


def wait_for_health(url, timeout=90):
    deadline = time.time() + timeout
    last_error = None
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=5) as response:
                if response.status == 200:
                    return
        except Exception as exc:
            last_error = exc
        time.sleep(2)
    raise RuntimeError(f"Timed out waiting for {url}: {last_error}")


def post_json(url, payload):
    data = json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8")
        try:
            return exc.code, json.loads(body)
        except json.JSONDecodeError:
            return exc.code, {"message": body}


def create_user():
    stamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    username = f"selenium_{stamp}"
    email = f"{username}@example.com"
    status, body = post_json(
        f"{BACKEND_URL}/api/auth/register",
        {"username": username, "email": email, "password": PASSWORD},
    )
    if status not in (200, 201):
        raise RuntimeError(f"Registration failed: {status} {body}")
    return username, email


def main():
    wait_for_health(f"{BACKEND_URL}/api/health")
    username, email = create_user()

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1440,1080")

    driver = webdriver.Chrome(options=chrome_options)
    try:
        driver.get(f"{FRONTEND_URL}/login")

        wait = WebDriverWait(driver, 30)
        identifier = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, 'input[placeholder="Username or Gmail"]')))
        password = driver.find_element(By.CSS_SELECTOR, 'input[placeholder="Password"]')

        identifier.send_keys(username)
        password.send_keys(PASSWORD)
        driver.find_element(By.XPATH, "//button[normalize-space()='Login']").click()

        wait.until(EC.url_contains("/"))
        wait.until(EC.presence_of_element_located((By.XPATH, "//*[contains(text(),'Welcome,')]")))

        assert "Welcome," in driver.page_source, "Dashboard did not render after login"
        print(f"SELENIUM_OK user={username} email={email}")
    finally:
        driver.quit()


if __name__ == "__main__":
    main()
