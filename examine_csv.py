import pandas as pd

# Read the first few rows of the CSV to understand the structure
df = pd.read_csv('ecommerce-dataset/archive/archive/products.csv', nrows=5)
print("CSV Structure:")
print(df.columns.tolist())
print("\nFirst 5 rows:")
print(df)
print(f"\nTotal rows in file: {len(pd.read_csv('ecommerce-dataset/archive/archive/products.csv'))}") 