const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

const connnection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Septiembre09#",
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
        default:
            connnection.end();
    }
}

function departmentSearch() {
    const query = "SELECT * from department";
    connnection.query(query, (err, res) => {
        if(err)
            throw err;

        console.table(res);
        mainPrompt();
    });
}