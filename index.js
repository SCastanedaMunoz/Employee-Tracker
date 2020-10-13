const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
const chalk = require("chalk");

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
        message: "What Would You Like to Do?",
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
    switch(action) {
        case "View All Departments":
            allDepartmentSearch();
            break;
        case "View All Roles":
            allRoleSearch();
            break;
        case "View All Employees":
            allEmployeeSearch();
            break;
        case "View All Employees by Department":
            allEmployeeByDepartmentSearch();
            break;
        case "View All Employees by Manager":
            allEmployeeByManagerSearch();
            break;
        case "Add Department":
            addDeparment();
            break;
        default:
            connnection.end();
    }
}

const allDepartmentQuery = "SELECT * FROM department";
function allDepartmentSearch() {
    consoleOutQuery(allDepartmentQuery, chalk.greenBright(`\nSeeing All Departments!\n`));
}

const allRoleQuery = "SELECT * FROM role";
function allRoleSearch() {
    consoleOutQuery(allRoleQuery, chalk.greenBright(`\nSeeing All Roles!\n`));
}

function allEmployeeSearch() {
    const allEmployeeQuery = 
    `SELECT 
	    e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(e1.first_name, " ", e1.last_name) as manager 
    FROM 
	    employee e
    INNER JOIN role r ON e.role_id = r.id 
    INNER JOIN department d ON r.department_id = d.id
    LEFT JOIN employee e1 ON e.manager_id = e1.id;`;
    consoleOutQuery(allEmployeeQuery, chalk.greenBright(`\nSeeing All Employees!\n`));
}

function allEmployeeByDepartmentSearch() {
    const allEmployeeQueryByDeparment = 
    `SELECT 
	    e.first_name, e.last_name, r.title, r.salary, CONCAT(e1.first_name, " ", e1.last_name) as manager 
    FROM 
	    employee e
    INNER JOIN role r ON e.role_id = r.id 
    LEFT JOIN employee e1 ON e.manager_id = e1.id
    WHERE r.department_id = ?`;
    connnection.query(allDepartmentQuery, (err, allDepRes) => {
        if(err)
            throw err;

        inquirer.prompt({
            name: "department",
            type: "list",
            message: "What Department Would You Like To See?",
            choices: allDepRes
        }).then(({department}) => {
            let {id} = allDepRes.find(item => item.name === department);
            connnection.query(allEmployeeQueryByDeparment, id, (err, res) => {
                if(err)
                    throw err;
                console.log(chalk.greenBright(`\nSeeing All Employees From ${department} Department!\n`))
                console.table(res);
                mainPrompt();
            })
        });
    });
}

const allManagersQuery = 
`SELECT 
    m.id, CONCAT(m.first_name, " ", m.last_name) AS name
FROM   employee e
JOIN   employee m on e.manager_id = m.id
GROUP BY (e.manager_id)`;
function allEmployeeByManagerSearch() {
   
    const allEmployeeByManagerQuery = 
    `SELECT 
	    e.first_name, e.last_name, r.title, r.salary, d.name AS department
    FROM 
	    employee e
    INNER JOIN role r ON e.role_id = r.id 
    INNER JOIN department d ON r.department_id = d.id
    WHERE e.manager_id = ?`;

    connnection.query(allManagersQuery, (err, allManagersRes) => {
        if(err)
            throw err;
        inquirer.prompt({
            name: "manager",
            type: "list",
            message: "What Manager's Employees Would You Like To See?",
            choices: allManagersRes
        }).then(({manager}) => {
            let {id} = allManagersRes.find(item => item.name === manager);
            connnection.query(allEmployeeByManagerQuery, id, (err, res) => {
                if(err)
                    throw err;
                console.log(chalk.greenBright(`\nSeeing All Employees Managed by ${manager}!\n`))
                console.table(res);
                mainPrompt();
            });
        });
    });
}

function addDeparment() {
    const addDepartmentQuery = 
    `INSERT INTO department (name)
    SELECT * FROM (SELECT ?) AS tmp
    WHERE NOT EXISTS (
        SELECT name FROM department WHERE name = ?
    )
    LIMIT 1`;
    inquirer.prompt({
        name: "department",
        type: "input",
        message: "What's the Department Name?",
        validate: async input => {

            if(!input || input.trim().length == 0)
                return 'Department Name Must be Provided';

            return true;
        }
    }).then(({department}) => {
        connnection.query(addDepartmentQuery, [department, department], (err, res) => {
            if(err)
                throw err;
            
            if(res.affectedRows === 0) {
                console.log(chalk.redBright(`\n${chalk.yellowBright(department)} Department Already Exists on Database Ignoring Query!\n`));
                return mainPrompt();
            }

            console.log(chalk.greenBright(`\nSuccessfully Added ${chalk.yellowBright(department)} Department`));
            allDepartmentSearch();
        });
    });
}

function consoleOutQuery(query, message) {
    connnection.query(query, (err, res) => {
        if(err)
            throw err;
        console.log(message);
        console.table(res);
        mainPrompt();
    });
}
