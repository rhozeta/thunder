-- Insert demo deals data
INSERT INTO deals (contact_id, title, deal_type, price, status, created_at) VALUES
-- John Doe's deals
('866917bd-8a8f-41ed-b05d-20ad16bc7d58', '3BR House in Downtown', 'buying', 450000.00, 'qualified', NOW()),
('866917bd-8a8f-41ed-b05d-20ad16bc7d58', 'Modern Condo with View', 'buying', 320000.00, 'prospect', NOW()),

-- Jane Smith's deals  
('70cada1b-6fb6-4053-91a5-4234bfa595c0', 'Family Home Sale', 'selling', 425000.00, 'negotiation', NOW()),
('70cada1b-6fb6-4053-91a5-4234bfa595c0', 'Luxury Property Listing', 'selling', 750000.00, 'prospect', NOW()),

-- Bob Johnson's deals
('489ec480-2614-4288-ba58-07b234639a9d', 'Investment Property Portfolio', 'investment', 280000.00, 'qualified', NOW()),
('489ec480-2614-4288-ba58-07b234639a9d', 'Commercial Real Estate Deal', 'investment', 650000.00, 'prospect', NOW()),

-- Additional demo deals
('6c2132dd-479e-4843-87d1-25ce16dc7174', 'Starter Home Purchase', 'buying', 275000.00, 'closed_won', NOW() - INTERVAL '7 days'),
('af17dcc6-af95-4049-b5f2-f1a7ceadfba6', 'Premium Listing Service', 'selling', 580000.00, 'proposal', NOW()),
('5a258d6a-7da1-4a2f-aa1a-5d1d8c3d86eb', 'First-Time Buyer Package', 'buying', 310000.00, 'qualified', NOW()),
('2bbf14bb-53bf-4738-9157-60a389e87d5b', 'Estate Sale Management', 'selling', 395000.00, 'negotiation', NOW());
