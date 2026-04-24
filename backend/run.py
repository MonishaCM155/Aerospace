from fetch import fetch_all_city_data
from upload import upload

def main():
    cities = fetch_all_city_data()
    upload(cities)
    print(f"✅ Updated {len(cities)} cities")

if __name__ == "__main__":
    main()
