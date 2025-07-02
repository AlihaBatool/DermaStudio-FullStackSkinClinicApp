	Backend Setup

•	Install PHP dependencies:
composer install
•	Start the Laravel development server:
php artisan serve

Note: Ensure the server runs on port 8000, as the frontend connects to this port.

•	To create a new Admin account, update values inside AdminSeeder.php, then run:
php artisan db:seed --class=AdminSeeder

•	Default Admin Credentials:
o	Username: Ali Ahmed
o	Password: aliahmed123

