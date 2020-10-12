const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connnection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_tracker"
});

connnection.connect(err => {
    if (err) {
        throw err;
    }
    mainPrompt();
});

function mainPrompt() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Departments",
            "View All Roles",
            "View All Employees",
            "View All Employees by Department",
            "View All Employees by Manager",
            "Add Department",
            "Add Role",
            "Add Employee",
            "Update Employee",
            "Update Employee Manager",
            "Remove Department",
            "Remove Role",
            "Remove Employee",
            "Exit"
        ]
    }).then(onMainPromptAnswer);
}

function onMainPromptAnswer({action}) {
    console.log(action);
    switch(action) {
        case "View All Departments":
            departmentSearch();
            break;
        case "View All Roles":
            roleSearch();
            break;
        case "View All Employees":
            allEmployeeSearch();
            break;
        default:
            connnection.end();
    }
}

function departmentSearch() {
    const query = "SELECT * FROM department";
    consoleOutQuery(query);
}

function roleSearch() {
    const query = "SELECT * FROM role";
    consoleOutQuery(query);
}

function allEmployeeSearch() {
    const query = 
    `SELECT 
	    e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(e1.first_name, " ", e1.last_name) as manager 
    FROM 
	    employee e
    INNER JOIN role r ON e.role_id = r.id 
    INNER JOIN department d ON r.department_id = d.id
    LEFT JOIN employee e1 ON e.manager_id = e1.id;`;
    consoleOutQuery(query);
}

function consoleOutQuery(query) {
    connnection.query(query, (err, res) => {
        if(err)
            throw err;

        console.table(res);
        mainPrompt();
    });
}
