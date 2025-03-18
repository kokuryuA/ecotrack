import requests
import json
from datetime import datetime
from tabulate import tabulate
import matplotlib.pyplot as plt

def test_prediction():
    # API endpoint
    url = "http://localhost:8000/predict"
    
    # Sample time series data with a pattern
    data = {
        "values": [
            100, 105, 102, 108, 106, 110, 105,  # Week 1
            103, 107, 104, 109, 108, 112, 107,  # Week 2
            105, 108, 106, 111, 110, 115, 109   # Week 3
        ],  # Historical values showing weekly patterns
        "horizon": 10  # Predict next 4 days
    }
    
    print("Historical Data:")
    print("Last", len(data["values"]), "days:", data["values"])
    print("\nRequesting predictions for next", data["horizon"], "days...")
    print("\n")
    
    # Make the POST request
    response = requests.post(url, json=data)
    
    print("Response Status Code:", response.status_code)
    
    if response.status_code == 200:
        result = response.json()
        print("\nPredictions for the next", result["horizon"], "days:")
        
        # Create a table of predictions
        table_data = []
        for date, pred in zip(result["forecast_dates"], result["predictions"]):
            table_data.append([date, f"{pred:.2f}"])
        
        # Print predictions in a nice table format
        headers = ["Date", "Predicted Value"]
        print(tabulate(table_data, headers=headers, tablefmt="grid"))
        
        # Plot the predictions
        plt.figure(figsize=(10, 5))
        
        # Plot historical data
        plt.plot(data["values"], label="Historical Data", marker='o')
        
        # Plot new predictions starting from halfway
        halfway_point = len(data["values"]) // 2
        plt.plot(range(halfway_point, halfway_point + len(result["predictions"])), result["predictions"], label="New Predictions", marker='x')
        
        plt.xlabel("Days")
        plt.ylabel("Values")
        plt.title("Comparison of Historical Data and New Predictions")
        plt.legend()
        plt.grid(True)
        plt.show()
        
        # Print raw predictions for verification
        print("\nRaw prediction values:", result["predictions"])
    else:
        print("\nError Response:")
        print(json.dumps(response.json(), indent=2))

if __name__ == "__main__":
    test_prediction() 