
# Setup app

* Create and activate virtual environment
* Switch to app root
* Execute `pip install -r requirements.txt`
* Create database
* Create tables and initial data:
```
	export DB_NAME=<db name>
	export DB_HOST=<db host>
	export DB_USER=<db owner>
	export DB_PWD=<owner password>
	./manage.py migrate_schema
	./manage.py create_tenant --domain=<site domain> --schema_name=public --name=Main
```

# Run app

Assuming you are in the project root with activated virtual environment::

	./manage.py runserver
