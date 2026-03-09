
# Database Schema

## businesses
id
name
logo_url
brand_color_primary
brand_color_secondary
system_mode
created_at

## staff
id
business_id
name
role
phone
profile_image
booking_slug
is_active
created_at

roles:
director
staff

## services
id
business_id
name
price
duration_minutes
deposit_percentage
is_active
created_at

## clients
id
name
phone
notes
created_at

## bookings
id
business_id
client_id
staff_id
service_id
booking_date
start_time
status
deposit_amount
payment_status
created_at

status:
pending
confirmed
cancelled

payment_status:
pending
paid
failed

## payments
id
booking_id
amount
payment_method
payment_status
transaction_id
created_at

## reference_images
id
booking_id
image_url
uploaded_at

## system_settings
id
business_id
booking_min_days
reference_image_retention_days
created_at
