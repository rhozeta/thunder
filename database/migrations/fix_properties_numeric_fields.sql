-- Fix numeric field overflow issues in properties table
-- The bathrooms field DECIMAL(3,1) can only store up to 99.9
-- Let's increase the precision to handle larger values

ALTER TABLE properties 
ALTER COLUMN bathrooms TYPE DECIMAL(5,1);

-- Also ensure other numeric fields can handle reasonable real estate values
-- bedrooms should be fine as INTEGER (up to 2 billion)
-- square_feet should be fine as INTEGER 
-- But let's make sure garage_spaces can handle larger values if needed
ALTER TABLE properties 
ALTER COLUMN garage_spaces TYPE INTEGER;

-- Financial fields look good with their current precision:
-- list_price DECIMAL(12,2) - up to $999,999,999,999.99
-- sale_price DECIMAL(12,2) - up to $999,999,999,999.99
-- estimated_value DECIMAL(12,2) - up to $999,999,999,999.99
-- hoa_fees DECIMAL(8,2) - up to $999,999.99
-- property_taxes DECIMAL(10,2) - up to $99,999,999.99
