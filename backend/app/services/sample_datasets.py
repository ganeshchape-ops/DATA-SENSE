import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_sales_data_dataset(n_samples: int = 550) -> pd.DataFrame:
    """
    Generate realistic 500+ record Enterprise Sales Data for AI Insight platform.
    Columns: Date, Product, Category, Region, Customer, Quantity, Sales, Cost, Profit, Discount, Rating
    """
    np.random.seed(42)
    start_date = datetime(2025, 1, 1)
    dates = [start_date + timedelta(days=int(i)) for i in np.random.randint(0, 365, size=n_samples)]
    dates.sort()

    categories = {
        "Technology": ["AI Workstation", "Cloud Server", "Enterprise Router", "Neural Coprocessor", "4K Monitor"],
        "Software": ["Analytics Suite Pro", "ML Studio License", "Data Pipeline ETL", "Security Shield", "BI Connector"],
        "Services": ["AI Strategy Consulting", "Model Fine-Tuning", "Cloud Migration", "Managed Ops", "Data Profiling Audit"],
        "Hardware": ["NVMe Storage Array", "Smart Sensor Hub", "Edge AI Gate", "Backup Power Unit", "Rack Mount Chassis"]
    }
    
    regions = ["North America", "Europe", "Asia-Pacific", "Latin America", "Middle East"]
    customers = [
        "Acme Global", "Nexus Dynamics", "Quantum Solutions", "Apex Retail",
        "Vertex Logistics", "Horizon Health", "Starlight Media", "Pinnacle Financial",
        "CyberTech Systems", "Atlas Automations", "Echo Ventures", "Summit Cloud"
    ]

    data = []
    cat_keys = list(categories.keys())

    for i in range(n_samples):
        cat = np.random.choice(cat_keys, p=[0.35, 0.30, 0.20, 0.15])
        prod = np.random.choice(categories[cat])
        region = np.random.choice(regions, p=[0.35, 0.25, 0.20, 0.12, 0.08])
        customer = np.random.choice(customers)
        quantity = int(np.random.choice([1, 2, 3, 4, 5, 8, 10, 15, 20], p=[0.30, 0.25, 0.18, 0.10, 0.07, 0.04, 0.03, 0.02, 0.01]))
        
        base_unit_price = {
            "Technology": np.random.uniform(450, 2400),
            "Software": np.random.uniform(250, 1800),
            "Services": np.random.uniform(600, 3200),
            "Hardware": np.random.uniform(180, 950)
        }[cat]

        discount = float(np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20, 0.25], p=[0.35, 0.25, 0.20, 0.10, 0.07, 0.03]))
        gross_sales = quantity * base_unit_price
        sales = round(gross_sales * (1.0 - discount), 2)
        
        cost_margin = {
            "Technology": np.random.uniform(0.55, 0.70),
            "Software": np.random.uniform(0.15, 0.35),
            "Services": np.random.uniform(0.35, 0.50),
            "Hardware": np.random.uniform(0.60, 0.75)
        }[cat]
        
        cost = round(sales * cost_margin, 2)
        profit = round(sales - cost, 2)
        rating = int(np.clip(np.random.normal(4.4 if profit > 300 else 3.8, 0.7), 1, 5))

        data.append({
            "Date": dates[i].strftime("%Y-%m-%d"),
            "Product": prod,
            "Category": cat,
            "Region": region,
            "Customer": customer,
            "Quantity": quantity,
            "Sales": sales,
            "Cost": cost,
            "Profit": profit,
            "Discount": discount,
            "Rating": rating
        })

    df = pd.DataFrame(data)
    # Realistic mild missingness for cleaning demo
    df.loc[df.sample(frac=0.02, random_state=42).index, "Discount"] = np.nan
    df.loc[df.sample(frac=0.015, random_state=43).index, "Rating"] = np.nan
    return df

def generate_ecommerce_dataset(n_samples: int = 500) -> pd.DataFrame:
    """Generate realistic E-Commerce Sales, Margin & Customer Experience Dataset."""
    np.random.seed(42)
    start_date = datetime(2025, 1, 1)
    dates = [start_date + timedelta(days=int(i)) for i in np.random.randint(0, 365, size=n_samples)]
    
    categories = {
        "Technology": ["Laptops", "Smartphones", "Accessories", "Monitors"],
        "Furniture": ["Office Chairs", "Standing Desks", "Bookcases", "Ergonomic Lamps"],
        "Office Supplies": ["Paper", "Binders", "Pens & Markers", "Storage Boxes"]
    }
    
    regions = ["North America", "Europe", "Asia-Pacific", "Latin America"]
    segments = ["Consumer", "Corporate", "Small Business"]
    payment_methods = ["Credit Card", "PayPal", "Bank Transfer", "Crypto"]
    
    cat_list = list(categories.keys())
    data = []
    
    for i in range(n_samples):
        cat = np.random.choice(cat_list, p=[0.4, 0.35, 0.25])
        sub_cat = np.random.choice(categories[cat])
        region = np.random.choice(regions)
        segment = np.random.choice(segments)
        pay_method = np.random.choice(payment_methods)
        
        age = int(np.clip(np.random.normal(38, 12), 18, 75))
        quantity = int(np.random.choice([1, 2, 3, 4, 5, 8, 10], p=[0.4, 0.25, 0.15, 0.1, 0.05, 0.03, 0.02]))
        
        base_unit_price = {
            "Technology": np.random.uniform(150, 1200),
            "Furniture": np.random.uniform(80, 650),
            "Office Supplies": np.random.uniform(10, 95)
        }[cat]
        
        sales = round(quantity * base_unit_price, 2)
        discount = np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20, 0.30], p=[0.35, 0.25, 0.2, 0.1, 0.07, 0.03])
        net_sales = round(sales * (1 - discount), 2)
        
        profit_margin = {
            "Technology": np.random.normal(0.22, 0.08),
            "Furniture": np.random.normal(0.15, 0.09),
            "Office Supplies": np.random.normal(0.35, 0.12)
        }[cat] - (discount * 1.2)
        
        profit = round(net_sales * profit_margin, 2)
        shipping_cost = round(np.random.uniform(5, 45) + (sales * 0.02), 2)
        satisfaction = int(np.clip(np.random.normal(4.2 if profit > 0 else 3.1, 0.8), 1, 5))
        returns = "Yes" if (satisfaction <= 2 and np.random.rand() > 0.4) else "No"
        
        data.append({
            "Order_Date": dates[i].strftime("%Y-%m-%d"),
            "Customer_Age": age,
            "Segment": segment,
            "Region": region,
            "Category": cat,
            "Sub_Category": sub_cat,
            "Payment_Method": pay_method,
            "Quantity": quantity,
            "Unit_Price": round(base_unit_price, 2),
            "Discount": discount,
            "Sales": net_sales,
            "Profit": profit,
            "Shipping_Cost": shipping_cost,
            "Customer_Rating": satisfaction,
            "Returned": returns
        })
        
    df = pd.DataFrame(data)
    df.loc[df.sample(frac=0.03, random_state=42).index, "Discount"] = np.nan
    df.loc[df.sample(frac=0.02, random_state=43).index, "Customer_Rating"] = np.nan
    return df

def generate_churn_dataset(n_samples: int = 450) -> pd.DataFrame:
    """Generate Customer Retention & Churn Prediction Dataset."""
    np.random.seed(101)
    contracts = ["Month-to-Month", "One Year", "Two Year"]
    internet_services = ["Fiber Optic", "DSL", "No Internet"]
    payment_methods = ["Electronic Check", "Mailed Check", "Bank Transfer", "Credit Card"]
    
    data = []
    for i in range(n_samples):
        gender = np.random.choice(["Male", "Female"])
        senior = int(np.random.choice([0, 1], p=[0.82, 0.18]))
        partner = np.random.choice(["Yes", "No"])
        dependents = np.random.choice(["Yes", "No"], p=[0.3, 0.7])
        contract = np.random.choice(contracts, p=[0.55, 0.25, 0.20])
        internet = np.random.choice(internet_services, p=[0.45, 0.35, 0.20])
        payment = np.random.choice(payment_methods)
        
        tenure = int(np.random.exponential(scale=24)) if contract == "Month-to-Month" else int(np.random.uniform(12, 72))
        tenure = int(np.clip(tenure, 1, 72))
        
        monthly = 25.0
        if internet == "Fiber Optic":
            monthly += np.random.uniform(45, 75)
        elif internet == "DSL":
            monthly += np.random.uniform(20, 45)
            
        tech_support = np.random.choice(["Yes", "No"]) if internet != "No Internet" else "No internet"
        online_security = np.random.choice(["Yes", "No"]) if internet != "No Internet" else "No internet"
        streaming_tv = np.random.choice(["Yes", "No"]) if internet != "No Internet" else "No internet"
        
        monthly = round(monthly + (8 if tech_support == "Yes" else 0) + (10 if streaming_tv == "Yes" else 0), 2)
        total_charges = round(monthly * tenure + np.random.normal(0, 15), 2)
        
        churn_score = 0.2
        if contract == "Month-to-Month":
            churn_score += 0.35
        if internet == "Fiber Optic":
            churn_score += 0.15
        if tech_support == "No":
            churn_score += 0.15
        if tenure < 12:
            churn_score += 0.2
        if senior == 1:
            churn_score += 0.08
            
        churn_prob = np.clip(churn_score, 0.05, 0.90)
        churned = "Yes" if np.random.rand() < churn_prob else "No"
        
        data.append({
            "CustomerID": f"CUST-{1000 + i}",
            "Gender": gender,
            "SeniorCitizen": senior,
            "Partner": partner,
            "Dependents": dependents,
            "Tenure_Months": tenure,
            "Contract": contract,
            "InternetService": internet,
            "OnlineSecurity": online_security,
            "TechSupport": tech_support,
            "StreamingTV": streaming_tv,
            "PaymentMethod": payment,
            "MonthlyCharges": monthly,
            "TotalCharges": total_charges,
            "Churn": churned
        })
        
    df = pd.DataFrame(data)
    df.loc[df.sample(frac=0.03, random_state=42).index, "TotalCharges"] = np.nan
    return df

def generate_housing_dataset(n_samples: int = 400) -> pd.DataFrame:
    """Generate Real Estate Valuation & Regression Dataset."""
    np.random.seed(202)
    furnishing = ["Furnished", "Semi-Furnished", "Unfurnished"]
    
    data = []
    for i in range(n_samples):
        area = int(np.clip(np.random.normal(2400, 950), 650, 7500))
        bedrooms = int(np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.25, 0.45, 0.20, 0.05]))
        bathrooms = int(np.clip(np.random.choice([1, 2, 3, 4], p=[0.4, 0.4, 0.15, 0.05]), 1, bedrooms + 1))
        stories = int(np.random.choice([1, 2, 3, 4], p=[0.45, 0.35, 0.15, 0.05]))
        main_road = np.random.choice(["yes", "no"], p=[0.85, 0.15])
        guestroom = np.random.choice(["yes", "no"], p=[0.2, 0.8])
        basement = np.random.choice(["yes", "no"], p=[0.35, 0.65])
        airconditioning = np.random.choice(["yes", "no"], p=[0.4, 0.6])
        parking = int(np.random.choice([0, 1, 2, 3], p=[0.3, 0.4, 0.25, 0.05]))
        furnish = np.random.choice(furnishing, p=[0.3, 0.45, 0.25])
        
        base_price = 150000 + (area * 95) + (bedrooms * 18000) + (bathrooms * 24000) + (stories * 15000)
        if main_road == "yes":
            base_price += 25000
        if guestroom == "yes":
            base_price += 18000
        if basement == "yes":
            base_price += 22000
        if airconditioning == "yes":
            base_price += 32000
        base_price += parking * 12000
        if furnish == "Furnished":
            base_price += 30000
        elif furnish == "Semi-Furnished":
            base_price += 15000
            
        noise = np.random.normal(0, 25000)
        final_price = round(max(85000, base_price + noise), 0)
        
        data.append({
            "PropertyID": f"PROP-{500 + i}",
            "Area_SqFt": area,
            "Bedrooms": bedrooms,
            "Bathrooms": bathrooms,
            "Stories": stories,
            "MainRoad": main_road,
            "Guestroom": guestroom,
            "Basement": basement,
            "Airconditioning": airconditioning,
            "Parking_Spots": parking,
            "Furnishing_Status": furnish,
            "Price": final_price
        })
        
    df = pd.DataFrame(data)
    df.loc[df.sample(frac=0.025, random_state=42).index, "Area_SqFt"] = np.nan
    return df

def generate_heart_dataset(n_samples: int = 350) -> pd.DataFrame:
    """Generate Clinical Heart Disease Classification Dataset."""
    np.random.seed(303)
    data = []
    for i in range(n_samples):
        age = int(np.clip(np.random.normal(54, 9), 29, 77))
        sex = np.random.choice(["Male", "Female"], p=[0.68, 0.32])
        cp = np.random.choice(["Typical Angina", "Atypical Angina", "Non-anginal Pain", "Asymptomatic"], p=[0.45, 0.25, 0.20, 0.10])
        trestbps = int(np.clip(np.random.normal(131, 18), 94, 200))
        chol = int(np.clip(np.random.normal(246, 51), 126, 564))
        fbs = int(np.random.choice([0, 1], p=[0.85, 0.15]))
        restecg = np.random.choice(["Normal", "ST-T Abnormality", "LV Hypertrophy"], p=[0.5, 0.45, 0.05])
        thalach = int(np.clip(np.random.normal(149 - (age - 50) * 0.5, 22), 71, 202))
        exang = np.random.choice(["Yes", "No"], p=[0.33, 0.67])
        oldpeak = round(float(np.clip(np.random.exponential(1.0), 0.0, 6.2)), 1)
        slope = np.random.choice(["Upsloping", "Flat", "Downsloping"], p=[0.45, 0.45, 0.10])
        
        risk = 0.35
        if sex == "Male":
            risk += 0.12
        if age > 55:
            risk += 0.15
        if cp != "Typical Angina":
            risk += 0.20
        if thalach > 155:
            risk += 0.12
        if exang == "Yes":
            risk -= 0.15
        if oldpeak > 2.0:
            risk -= 0.18
            
        disease_prob = np.clip(risk, 0.1, 0.9)
        has_disease = 1 if np.random.rand() < disease_prob else 0
        
        data.append({
            "PatientID": f"PT-{100 + i}",
            "Age": age,
            "Sex": sex,
            "ChestPainType": cp,
            "RestingBP": trestbps,
            "Cholesterol": chol,
            "FastingBloodSugar": fbs,
            "RestingECG": restecg,
            "MaxHeartRate": thalach,
            "ExerciseAngina": exang,
            "ST_Depression": oldpeak,
            "ST_Slope": slope,
            "HeartDiseaseTarget": has_disease
        })
        
    df = pd.DataFrame(data)
    df.loc[df.sample(frac=0.02, random_state=42).index, "Cholesterol"] = np.nan
    return df

def generate_traffic_forecasting_dataset(n_days: int = 180) -> pd.DataFrame:
    """Generate Daily Web Traffic & Revenue Time Series Dataset."""
    np.random.seed(404)
    start_date = datetime(2025, 1, 1)
    dates = [start_date + timedelta(days=i) for i in range(n_days)]
    
    data = []
    base_visitors = 4200
    trend_slope = 15.5
    
    for i, date in enumerate(dates):
        day_of_week = date.weekday()
        weekend_mult = 0.82 if day_of_week in [5, 6] else 1.08
        trend = base_visitors + (i * trend_slope)
        seasonal = np.sin(2 * np.pi * i / 7) * 450 + np.cos(2 * np.pi * i / 30) * 300
        noise = np.random.normal(0, 250)
        
        visitors = int(max(1000, (trend + seasonal + noise) * weekend_mult))
        page_views = int(visitors * np.random.uniform(2.8, 4.2))
        bounce_rate = round(float(np.clip(np.random.normal(42.5, 4.0), 25.0, 75.0)), 2)
        ad_clicks = int(visitors * np.random.uniform(0.04, 0.08))
        conversion_rate = round(float(np.clip(np.random.normal(3.2, 0.5), 1.0, 8.0)), 2)
        conversions = int(visitors * (conversion_rate / 100.0))
        avg_order_value = np.random.uniform(45.0, 78.0)
        daily_revenue = round(conversions * avg_order_value + (ad_clicks * 1.25), 2)
        
        data.append({
            "Date": date.strftime("%Y-%m-%d"),
            "Daily_Visitors": visitors,
            "Page_Views": page_views,
            "Bounce_Rate_Pct": bounce_rate,
            "Ad_Clicks": ad_clicks,
            "Conversion_Rate_Pct": conversion_rate,
            "Daily_Revenue_USD": daily_revenue
        })
        
    return pd.DataFrame(data)

def generate_student_results_dataset(n_samples: int = 150) -> pd.DataFrame:
    """
    Generate realistic Student Academic Performance Dataset.
    Columns: Student_ID, Name, Maths, Science, English, Computer, Attendance
    """
    np.random.seed(42)
    first_names = [
        "Aarav", "Aditi", "Rohan", "Ananya", "Vihaan", "Diya", "Kabir", "Meera",
        "Arjun", "Ishita", "Dev", "Sneha", "Karan", "Pooja", "Vikram", "Riya",
        "Aditya", "Tanvi", "Siddharth", "Nisha", "Rahul", "Priya", "Amit", "Kavya",
        "Aryan", "Neha", "Manish", "Shreya", "Nikhil", "Divya", "Gaurav", "Anjali"
    ]
    last_names = [
        "Sharma", "Verma", "Gupta", "Patel", "Singh", "Kumar", "Iyer", "Reddy",
        "Nair", "Deshmukh", "Chopra", "Mehta", "Joshi", "Kapoor", "Bhat", "Shah"
    ]

    data = []
    for i in range(1, n_samples + 1):
        name = f"{np.random.choice(first_names)} {np.random.choice(last_names)}"
        
        # Correlated academic skill with subject variance
        ability = np.random.normal(68, 14)
        
        maths = int(np.clip(np.random.normal(ability + 2, 10), 22, 100))
        science = int(np.clip(np.random.normal(ability - 1, 9), 25, 100))
        english = int(np.clip(np.random.normal(ability + 4, 8), 30, 100))
        computer = int(np.clip(np.random.normal(ability + 6, 11), 28, 100))
        
        # Attendance correlated with performance
        att_base = 65 + (ability * 0.35)
        attendance = round(float(np.clip(np.random.normal(att_base, 6), 45.0, 99.5)), 1)

        data.append({
            "Student_ID": f"STU-{1000 + i}",
            "Name": name,
            "Maths": maths,
            "Science": science,
            "English": english,
            "Computer": computer,
            "Attendance": attendance
        })

    return pd.DataFrame(data)

def generate_ecommerce_sales_standard(n_samples: int = 250) -> pd.DataFrame:
    """
    Generate standard E-Commerce Sales Dataset.
    Columns: Product, Category, Price, Quantity, Revenue, Profit, Discount, Rating
    """
    np.random.seed(42)
    catalog = [
        ("AI Workstation Pro", "Hardware", 1450.0, 0.28),
        ("Cloud Server Node", "Hardware", 2200.0, 0.32),
        ("Analytics Suite License", "Software", 850.0, 0.65),
        ("Data Pipeline ETL Connector", "Software", 450.0, 0.70),
        ("Neural Coprocessor Card", "Hardware", 620.0, 0.35),
        ("Managed Cloud Consulting", "Services", 1200.0, 0.45),
        ("Security Audit Package", "Services", 950.0, 0.50),
        ("Enterprise Storage Array", "Hardware", 1800.0, 0.30),
        ("BI Dashboard Pro", "Software", 350.0, 0.75),
        ("Edge Gateway Device", "Hardware", 520.0, 0.38)
    ]

    data = []
    for _ in range(n_samples):
        prod, cat, price, margin = catalog[np.random.choice(len(catalog))]
        qty = int(np.random.choice([1, 2, 3, 4, 5, 8, 10], p=[0.35, 0.25, 0.18, 0.10, 0.06, 0.04, 0.02]))
        disc = float(np.random.choice([0.0, 0.05, 0.10, 0.15, 0.20], p=[0.40, 0.25, 0.20, 0.10, 0.05]))
        
        gross = round(price * qty, 2)
        revenue = round(gross * (1.0 - disc), 2)
        profit = round(revenue * margin, 2)
        rating = round(float(np.clip(np.random.normal(4.3, 0.6), 1.0, 5.0)), 1)

        data.append({
            "Product": prod,
            "Category": cat,
            "Price": price,
            "Quantity": qty,
            "Revenue": revenue,
            "Profit": profit,
            "Discount": disc,
            "Rating": rating
        })

    return pd.DataFrame(data)

def generate_employee_dataset(n_samples: int = 180) -> pd.DataFrame:
    """
    Generate Employee / HR Analytics Dataset.
    Columns: Employee_ID, Department, Age, Salary, Experience, Performance
    """
    np.random.seed(42)
    departments = ["Engineering", "Product", "Sales", "Marketing", "Human Resources", "Finance"]
    dept_weights = [0.30, 0.18, 0.22, 0.12, 0.08, 0.10]
    
    data = []
    for i in range(1, n_samples + 1):
        dept = np.random.choice(departments, p=dept_weights)
        exp = int(np.clip(np.random.exponential(4.5), 1, 25))
        age = int(22 + exp + np.random.randint(0, 8))
        
        base_sal = {
            "Engineering": 85000,
            "Product": 92000,
            "Sales": 65000,
            "Marketing": 62000,
            "Human Resources": 58000,
            "Finance": 75000
        }[dept]
        
        salary = int(base_sal + (exp * 6800) + np.random.normal(0, 8500))
        perf = int(np.clip(np.random.choice([1, 2, 3, 4, 5], p=[0.05, 0.15, 0.45, 0.25, 0.10]), 1, 5))

        data.append({
            "Employee_ID": f"EMP-{1000 + i}",
            "Department": dept,
            "Age": age,
            "Salary": salary,
            "Experience": exp,
            "Performance": perf
        })

    return pd.DataFrame(data)

def generate_banking_dataset(n_samples: int = 200) -> pd.DataFrame:
    """
    Generate Banking & Customer Credit Risk Dataset.
    Columns: Customer_ID, Age, Income, Credit_Score, Balance, Loan, Default
    """
    np.random.seed(42)
    data = []
    for i in range(1, n_samples + 1):
        age = int(np.random.normal(41, 11))
        age = max(21, min(72, age))
        
        income = int(np.clip(np.random.normal(68000, 24000), 22000, 180000))
        
        credit_score = int(np.clip(np.random.normal(690 + (income / 5000), 65), 350, 850))
        balance = int(np.clip(np.random.normal(income * 0.45, 18000), 500, 250000))
        loan = int(np.clip(np.random.normal(income * 0.75, 25000), 2000, 350000))
        
        # Default probability increases if credit score < 620 and high loan-to-income
        def_prob = 0.03
        if credit_score < 600:
            def_prob += 0.35
        if loan > income * 1.2:
            def_prob += 0.20
        is_default = int(np.random.rand() < min(0.85, def_prob))

        data.append({
            "Customer_ID": f"CUST-{2000 + i}",
            "Age": age,
            "Income": income,
            "Credit_Score": credit_score,
            "Balance": balance,
            "Loan": loan,
            "Default": is_default
        })

    return pd.DataFrame(data)

def generate_generic_dataset(n_samples: int = 200) -> pd.DataFrame:
    """
    Generate Unrelated Generic Industrial Sensor Dataset.
    Columns: Sensor_ID, Temperature, Pressure, Vibration, Efficiency, Status_Code, Batch
    """
    np.random.seed(42)
    batches = ["Batch-Alpha", "Batch-Beta", "Batch-Gamma", "Batch-Delta"]
    status_codes = ["Normal", "Warning", "Critical", "Maintenance"]
    
    data = []
    for i in range(1, n_samples + 1):
        temp = round(float(np.random.normal(72.5, 8.4)), 2)
        pressure = round(float(np.random.normal(101.3, 14.2)), 2)
        vibration = round(float(np.random.exponential(1.8)), 3)
        efficiency = round(float(np.clip(98.5 - (temp * 0.12) - (vibration * 2.1), 40.0, 99.9)), 2)
        status = "Critical" if efficiency < 65.0 or temp > 90.0 else ("Warning" if efficiency < 80.0 else "Normal")
        batch = np.random.choice(batches)

        data.append({
            "Sensor_ID": f"SNS-{3000 + i}",
            "Temperature": temp,
            "Pressure": pressure,
            "Vibration": vibration,
            "Efficiency": efficiency,
            "Status_Code": status,
            "Batch": batch
        })

    return pd.DataFrame(data)

SAMPLE_GENERATORS = {
    # 5 Main Required Domains (Step 22)
    "student": ("Student Academic Performance (Maths, Science, Attendance)", generate_student_results_dataset),
    "student_results": ("Student Academic Performance Results", generate_student_results_dataset),
    "ecommerce": ("E-Commerce Sales & Profit Engine (Revenue, Profit, Rating)", generate_ecommerce_sales_standard),
    "ecommerce_sales": ("E-Commerce Commercial Sales", generate_ecommerce_sales_standard),
    "hr": ("HR Workforce & Salary Analytics (Department, Salary, Attrition)", generate_employee_dataset),
    "employee_data": ("HR Employee Workforce Data", generate_employee_dataset),
    "banking": ("Banking & Credit Risk Portfolio (Credit Score, Balance, Default)", generate_banking_dataset),
    "banking_data": ("Banking Customer Portfolio", generate_banking_dataset),
    "generic": ("Universal Industrial Sensor & Telemetry Data (Temp, Pressure, Efficiency)", generate_generic_dataset),
    "generic_data": ("Universal Multi-Variable Dataset", generate_generic_dataset),
    # Additional Preloaded Datasets
    "sales_data": ("Enterprise Sales, Cost & Profit Dataset (550+ Records)", generate_sales_data_dataset),
    "churn": ("Customer Churn & Retention Dataset", generate_churn_dataset),
    "housing": ("Real Estate Valuation & Housing Prices", generate_housing_dataset),
    "heart": ("Clinical Heart Disease Risk Assessment", generate_heart_dataset),
    "traffic": ("Web Traffic & Daily Revenue Forecast", generate_traffic_forecasting_dataset)
}

