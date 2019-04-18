//MARK - Budget Controller
var budgetController = (function() {
    var budgetData;

    budgetData = {
        items: {
            inc: [],
            exp: []
        },
        totals: {
            totalInc: 0,
            totalExp: 0,
            percentage: -1
        }
    };

    function Income(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value
    }

    function Expenses(id, description, value, percentage) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = percentage
    }

    function calcItemPercentage () {
        budgetData.items.exp.forEach(function(element) {
            if (budgetData.totals.totalInc > 0) {
                element.percentage = Math.round((element.value / budgetData.totals.totalInc) * 100);
            }
            else {
                element.percentage = -1;
            }
            
        })
    }
    
    return {
        addItem: function(obj) {
            var item;
            
            if (obj.type === "inc") {
                var id;

                if (budgetData.items.inc.length > 0) {
                    id = budgetData.items.inc[budgetData.items.inc.length - 1].id + 1;
                }
                else {
                    id = 0;
                }
                
                item = new Income(id, obj.description, parseFloat(obj.value));
                budgetData.items.inc.push(item);
            }
            else if (obj.type === "exp") {
                var id;

                if (budgetData.items.exp.length > 0) {
                    id = budgetData.items.exp[budgetData.items.exp.length - 1].id + 1;
                }
                else {
                    id = 0;
                }
                
                item = new Expenses(id, obj.description, parseFloat(obj.value), -1);
                budgetData.items.exp.push(item); 
            }

            return item;
        },

        deleteItem: function (type, ID) {
            var idArray, itemArrayPosition;

            idArray = budgetData.items[type].map(value => value.id)
            itemArrayPosition = idArray.indexOf(ID);

            budgetData.items[type].splice(itemArrayPosition, 1);
        },

        getBudgetData: function() {
            return budgetData;
        },

        calcBudget: function() {
            var sumInc, sumExp;
            sumInc = 0;
            sumExp = 0;

            budgetData.items.inc.forEach(element => {
                sumInc += element.value;
            });

            budgetData.items.exp.forEach(element => {
                sumExp += element.value;
            });

            budgetData.totals.totalInc = sumInc;
            budgetData.totals.totalExp = sumExp;
            if (sumInc !== 0) {
                budgetData.totals.percentage = Math.round((sumExp / sumInc) * 100); 
            }
            else {
                budgetData.totals.percentage = -1;
            }

            calcItemPercentage();
        }

    }
})();

//MARK - UI Controller

 var uiController = (function() {
    var domStrings = {
        type: ".add__type",
        description: ".add__description",
        value: ".add__value",
        addButton: ".add__btn",
        incomeList: ".income__list",
        expensesList: ".expenses__list",
        budgetIncomeValue: ".budget__income--value",
        budgetExpensesValue: ".budget__expenses--value",
        budgetExpensesPercentage: ".budget__expenses--percentage",
        budgetValue: ".budget__value",
        container: ".container",
        monthLabel: ".budget__title--month"
    }

    //Formating number to format 99,999.00
    function formatNumber(number, type) {
        var splipNumber, int, dec, result;
        number = Math.abs(number);
        number = number.toFixed(2);

        splipNumber = number.split(".");
        int = splipNumber[0];
        dec = splipNumber[1];
        
        if ((int.length / 3 > 1)) {
            if (int.length % 3 === 0) {
                result = "";
                for(var i = 0; i < (int.length / 3); i++) {
                    result += int.substr((int.length % 3) + (3 * i), 3);
                    result += ((i + 1) < (int.length / 3)) ? "," : "";
                }
            }
            else {
                result = int.substr(0, (int.length % 3));
                for(var i = 0; i < Math.floor(int.length / 3); i++) {
                    result += "," + int.substr((int.length % 3) + (3 * i), 3); 
                }
            }
        }
        else {
            result = int;
        }

        if (type === "inc") {
            result = "+" + result + "." + dec;
        }
        else if (type === "exp") {
            result = "-" + result + "." + dec;
        }

        return result;
    }
    
    function forEachElementNodeList(fields, callbackfunc) {
        for (var i = 0; i < fields.length; i++) {
            callbackfunc(fields[i], i);
        }
    }

    return {
        getInput: function() {
            var item = {
                type: document.querySelector(domStrings.type).value,
                description: document.querySelector(domStrings.description).value,
                value: parseFloat(document.querySelector(domStrings.value).value)
            };
            return item;
        },

        getDOMStrings: function() {
            return domStrings;
        },

        clearInput: function() {
            document.querySelector(domStrings.description).value = "";
            document.querySelector(domStrings.value).value = "";
            document.querySelector(domStrings.type).focus(); 
        },

        addListItem: function(type, item) {
            if (type === "inc") {
                var html, newHtml;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                newHtml = html.replace("%id%", item.id);
                newHtml = newHtml.replace("%description%", item.description);
                newHtml = newHtml.replace("%value%", formatNumber(item.value, type));

                document.querySelector(domStrings.incomeList).insertAdjacentHTML("beforeend", newHtml);
            }
            else if (type === "exp") {
                var html, newHtml;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
                newHtml = html.replace("%id%", item.id);
                newHtml = newHtml.replace("%description%", item.description);
                newHtml = newHtml.replace("%value%", formatNumber(item.value, type));
                newHtml = newHtml.replace("%percentage%", "");

                document.querySelector(domStrings.expensesList).insertAdjacentHTML("beforeend", newHtml);
            }
        },

        deleteListItem(itemClassID) {
            var element;
            element = document.getElementById(itemClassID);
            element.parentNode.removeChild(element);           
        },

        displayBudget: function(obj) {
            var budgetValue;

            budgetValue = obj.totals.totalInc - obj.totals.totalExp;
            if (budgetValue >= 0) {
                document.querySelector(domStrings.budgetValue).textContent = formatNumber(budgetValue, "inc");
            }
            else if (budgetValue < 0) {
                document.querySelector(domStrings.budgetValue).textContent = formatNumber(budgetValue, "exp");
            }
            
            document.querySelector(domStrings.budgetIncomeValue).textContent = formatNumber(obj.totals.totalInc, "inc");
            document.querySelector(domStrings.budgetExpensesValue).textContent = formatNumber(obj.totals.totalExp, "exp");
            
            if (obj.totals.percentage >= 0) {
                document.querySelector(domStrings.budgetExpensesPercentage).textContent = obj.totals.percentage + "%";
            }
            else {
                document.querySelector(domStrings.budgetExpensesPercentage).textContent = "---";
            }
        },

        updateItemsPercentage: function(obj) {
            obj.items.exp.forEach(function(element) {
                var elementDocPercentage;

                if (document.getElementById("exp-" + element.id).children[1].children[1]) {
                    elementDocPercentage = document.getElementById("exp-" + element.id).children[1].children[1];
                    if (element.percentage > 0) {
                        elementDocPercentage.textContent = element.percentage + "%";
                    }
                    else {
                        element;elementDocPercentage.textContent = "---";
                    }
                }
            })
        },

        resetUI: function() {
            document.querySelector(domStrings.budgetValue).textContent = "+ 0.00";
            document.querySelector(domStrings.budgetIncomeValue).textContent = "+ 0.00";
            document.querySelector(domStrings.budgetExpensesValue).textContent = "- 0.00";
            document.querySelector(domStrings.budgetExpensesPercentage).textContent = "---";
            document.querySelector(domStrings.type).focus();
        },

        displayMonth: function() {
            var now, monthNumber, months, year;

            now = new Date();

            monthNumber = now.getMonth();
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "Dexember"];
            year = now.getFullYear();

            document.querySelector(domStrings.monthLabel).textContent = months[monthNumber] + " " + year;
        },

        changeType: function() {
            var fields = document.querySelectorAll(
                domStrings.type + "," +
                domStrings.description + "," +
                domStrings.value + ""
            )

            forEachElementNodeList(fields, function(element) {
                element.classList.toggle("red-focus");
            })

            document.querySelector(domStrings.addButton).classList.toggle("red");
        
        }

    }
})();

//MARK - App Controller

var controller = (function (budgetCntrl, uiCntrl) {
    var inputData, budgetItem, domStrings;

    function cntrlKeyboard(event) {
        if (event.keycode === 13 || event.which === 13) {
            cntrlAddItem();
        }
    }

    function addEventListeners () {
        document.querySelector(domStrings.addButton).addEventListener("click", cntrlAddItem);
        document.querySelector(domStrings.value).addEventListener("keyup", cntrlKeyboard);
        document.querySelector(domStrings.container).addEventListener("click", ctrlDeleteItem);
        document.querySelector(domStrings.type).addEventListener("change", uiCntrl.changeType);
    }

    function ctrlDeleteItem(event) {
        var itemClassID, splitItemClassID, type, ID;

        itemClassID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitItemClassID = itemClassID.split("-");
        type = splitItemClassID[0];
        ID = parseInt(splitItemClassID[1]);

        //2. Delete element from budget model
        budgetCntrl.deleteItem(type, ID);

        //3. Delete element from UI
        uiCntrl.deleteListItem(itemClassID);

        //4. Update budget and present it on UI
        updateBudget();
    }

    function cntrlAddItem() {
        //1. Get item from UI
        inputData = uiCntrl.getInput();

        if (isInputDataCorrect(inputData)) {
            //2. Add item to data model
            budgetItem = budgetCntrl.addItem(inputData);

            //3. Update UI (clear input forms)
            uiCntrl.clearInput();

            //4. Update UI (add item)
            uiCntrl.addListItem(inputData.type, budgetItem);

            //5. Update the budget and present it on UI
            updateBudget();
        }
    }

    function updateBudget() {
        var budgetData;
        
        //1. Calculate budget and get data from data model
        budgetCntrl.calcBudget();

        //2. Get new data from data model
        budgetData = budgetCntrl.getBudgetData();

        //3. Update UI (show new budget)
        uiCntrl.displayBudget(budgetData);

        //4. Update percentage of expences items
        uiCntrl.updateItemsPercentage(budgetData);
    }

    function isInputDataCorrect(input) {
        if (input.description === "" || input.value <= 0 || isNaN(input.value)) {
            return false;
        }
        else {
            return true;
        }
    }

    return {
        init: function() {
            domStrings = uiCntrl.getDOMStrings();

            uiCntrl.displayMonth();
            uiCntrl.resetUI();
            addEventListeners();
        }
    }

})(budgetController, uiController);

controller.init();