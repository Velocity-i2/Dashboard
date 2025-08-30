// Global variables
let incomeData = JSON.parse(localStorage.getItem('incomeData')) || [];
let expenseData = JSON.parse(localStorage.getItem('expenseData')) || [];
let taskData = JSON.parse(localStorage.getItem('taskData')) || [];
let paymentData = JSON.parse(localStorage.getItem('paymentData')) || [];

// Settings data
let incomeSources = JSON.parse(localStorage.getItem('incomeSources')) || ['Salary', 'Freelance', 'Investment', 'Business', 'Other'];
let expenseCategories = JSON.parse(localStorage.getItem('expenseCategories')) || ['Food', 'Transportation', 'Utilities', 'Entertainment', 'Healthcare', 'Shopping', 'Other'];
let taskCategories = JSON.parse(localStorage.getItem('taskCategories')) || ['Work', 'Personal', 'Health', 'Education', 'Finance'];
let paymentTypes = JSON.parse(localStorage.getItem('paymentTypes')) || ['Cash', 'Bank Transfer', 'Credit Card', 'PayPal', 'Cryptocurrency'];
let productList = JSON.parse(localStorage.getItem('productList')) || ['T-Shirt', 'Hoodie', 'Mug', 'Poster', 'Sticker', 'Cap', 'Bag', 'Phone Case'];

let currentEditId = null;
let currentEditType = null;
let incomeChart = null;
let paymentChart = null;

// Calculate total amount for orders
function calculateTotal() {
    const quantity = parseFloat(document.getElementById('taskQuantity').value) || 0;
    const price = parseFloat(document.getElementById('taskPrice').value) || 0;
    const total = quantity * price;
    document.getElementById('taskTotal').value = total.toFixed(2);
}

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    updateDashboard();
    renderAllTables();
    populateDropdowns();
    renderSettingsLists();
    
    // Set default dates to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('incomeDate').value = today;
    document.getElementById('expenseDate').value = today;
    document.getElementById('taskDate').value = today;
    document.getElementById('taskDeadline').value = today;
});

// Theme management
function initializeTheme() {
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark');
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', isDark);
    // Re-render charts with new theme colors
    setTimeout(() => {
        renderCharts();
    }, 100);
}

// Page navigation
function showPage(pageId) {
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => page.classList.add('hidden'));
    
    const targetPage = document.getElementById(pageId + 'Page');
    if (targetPage) {
        targetPage.classList.remove('hidden');
        targetPage.classList.add('fade-in');
    }
    
    // Update active nav item
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('bg-blue-100', 'dark:bg-blue-900'));
    event.target.closest('.nav-item').classList.add('bg-blue-100', 'dark:bg-blue-900');
    
    if (pageId === 'dashboard') {
        updateDashboard();
        setTimeout(renderCharts, 100);
    }
}

// Dashboard updates
function updateDashboard() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyIncome = incomeData
        .filter(item => {
            const date = new Date(item.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    
    const monthlyExpenses = expenseData
        .filter(item => {
            const date = new Date(item.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, item) => sum + parseFloat(item.amount), 0);
    
    const netBalance = monthlyIncome - monthlyExpenses;
    const totalTasks = taskData.length;
    const pendingTasks = taskData.filter(task => task.status === 'pending').length;
    const completedTasks = taskData.filter(task => task.status === 'completed').length;
    const totalPayments = paymentData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    document.getElementById('totalIncome').textContent = `$${monthlyIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${monthlyExpenses.toFixed(2)}`;
    document.getElementById('netBalance').textContent = `$${netBalance.toFixed(2)}`;
    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('pendingTasks').textContent = pendingTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('totalPayments').textContent = `$${totalPayments.toFixed(2)}`;
}

// Detail Modal
function openDetailModal(type) {
    const modal = document.getElementById('detailModal');
    const title = document.getElementById('detailModalTitle');
    const content = document.getElementById('detailModalContent');
    
    let data = [];
    let tableHTML = '';
    
    switch(type) {
        case 'income':
            title.textContent = 'Income Details';
            data = incomeData;
            tableHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Source</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${data.map(item => `
                            <tr>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${new Date(item.date).toLocaleDateString()}</td>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.source}</td>
                                <td class="px-4 py-2 text-sm font-medium text-green-600">$${parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'expenses':
            title.textContent = 'Expense Details';
            data = expenseData;
            tableHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Category</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${data.map(item => `
                            <tr>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${new Date(item.date).toLocaleDateString()}</td>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.category}</td>
                                <td class="px-4 py-2 text-sm font-medium text-red-600">$${parseFloat(item.amount).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
            break;
        case 'tasks':
            title.textContent = 'All Orders';
            data = taskData;
            break;
        case 'pending-tasks':
            title.textContent = 'Pending Orders';
            data = taskData.filter(task => task.status === 'pending');
            break;
        case 'completed-tasks':
            title.textContent = 'Completed Orders';
            data = taskData.filter(task => task.status === 'completed');
            break;
    }
    
    // Generate table HTML for task-related modals
    if (type === 'tasks' || type === 'pending-tasks' || type === 'completed-tasks') {
        tableHTML = `
            <table class="w-full">
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Product Name</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Quantity</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Location</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                    ${data.map(item => {
                        const statusColors = {
                            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
                            'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        };
                        return `
                            <tr>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.client}</td>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.product}</td>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.quantity}</td>
                                <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.area}</td>
                                <td class="px-4 py-2">
                                    <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[item.status]}">
                                        ${item.status.charAt(0).toUpperCase() + item.status.slice(1).replace('-', ' ')}
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    } else {
        // Handle other modal types (income, expenses, payments)
        switch(type) {
        case 'payments':
            title.textContent = 'Payment Details';
            data = paymentData;
            tableHTML = `
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Client</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Amount</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
                        ${data.map(item => {
                            const status = parseFloat(item.received) >= parseFloat(item.amount) ? 'Paid' : 'Pending';
                            const statusColor = status === 'Paid' ? 'text-green-600' : 'text-red-600';
                            return `
                                <tr>
                                    <td class="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">${item.client}</td>
                                    <td class="px-4 py-2 text-sm font-medium text-purple-600">$${parseFloat(item.amount).toFixed(2)}</td>
                                    <td class="px-4 py-2 text-sm font-medium ${statusColor}">${status}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            `;
            break;
        }
    }
    
    content.innerHTML = data.length > 0 ? tableHTML : '<p class="text-gray-500 dark:text-gray-400 text-center py-8">No data available</p>';
    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// Chart rendering
function renderCharts() {
    renderIncomeExpenseChart();
    renderPaymentStatusChart();
}

function renderIncomeExpenseChart() {
    const ctx = document.getElementById('incomeExpenseChart').getContext('2d');
    
    if (incomeChart) {
        incomeChart.destroy();
    }
    
    // Get last 6 months data
    const months = [];
    const incomeByMonth = [];
    const expenseByMonth = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        months.push(monthYear);
        
        const monthIncome = incomeData
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
        const monthExpense = expenseData
            .filter(item => {
                const itemDate = new Date(item.date);
                return itemDate.getMonth() === date.getMonth() && itemDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, item) => sum + parseFloat(item.amount), 0);
        
        incomeByMonth.push(monthIncome);
        expenseByMonth.push(monthExpense);
    }
    
    incomeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Income',
                data: incomeByMonth,
                borderColor: '#10B981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }, {
                label: 'Expenses',
                data: expenseByMonth,
                borderColor: '#EF4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151'
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
                    }
                },
                x: {
                    ticks: {
                        color: document.documentElement.classList.contains('dark') ? '#9CA3AF' : '#6B7280'
                    },
                    grid: {
                        color: document.documentElement.classList.contains('dark') ? '#374151' : '#E5E7EB'
                    }
                }
            }
        }
    });
}

function renderPaymentStatusChart() {
    const ctx = document.getElementById('paymentStatusChart').getContext('2d');
    
    if (paymentChart) {
        paymentChart.destroy();
    }
    
    const paidAmount = paymentData
        .filter(payment => parseFloat(payment.received) >= parseFloat(payment.amount))
        .reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    
    const pendingAmount = paymentData
        .filter(payment => parseFloat(payment.received) < parseFloat(payment.amount))
        .reduce((sum, payment) => sum + (parseFloat(payment.amount) - parseFloat(payment.received)), 0);
    
    const receivedAmount = paymentData.reduce((sum, payment) => sum + parseFloat(payment.received), 0);
    
    paymentChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Received', 'Pending'],
            datasets: [{
                data: [receivedAmount, pendingAmount],
                backgroundColor: ['#10B981', '#F59E0B'],
                borderWidth: 2,
                borderColor: document.documentElement.classList.contains('dark') ? '#1F2937' : '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: document.documentElement.classList.contains('dark') ? '#E5E7EB' : '#374151',
                        padding: 20
                    }
                }
            }
        }
    });
}

// Populate dropdowns
function populateDropdowns() {
    populateSelect('incomeSource', incomeSources);
    populateSelect('expenseCategory', expenseCategories);
    populateSelect('paymentType', paymentTypes);
    populateSelect('taskProduct', productList);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Select...</option>';
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Income management
function openIncomeModal(id = null) {
    currentEditId = id;
    currentEditType = 'income';
    
    if (id) {
        const income = incomeData.find(item => item.id === id);
        document.getElementById('incomeDate').value = income.date;
        document.getElementById('incomeSource').value = income.source;
        document.getElementById('incomeAmount').value = income.amount;
        document.getElementById('incomeNotes').value = income.notes;
        document.querySelector('#incomeModal h3').textContent = 'Edit Income';
    } else {
        document.getElementById('incomeForm').reset();
        document.getElementById('incomeDate').value = new Date().toISOString().split('T')[0];
        document.querySelector('#incomeModal h3').textContent = 'Add Income';
    }
    
    document.getElementById('incomeModal').classList.remove('hidden');
}

function closeIncomeModal() {
    document.getElementById('incomeModal').classList.add('hidden');
    currentEditId = null;
    currentEditType = null;
}

document.getElementById('incomeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const incomeItem = {
        id: currentEditId || Date.now().toString(),
        date: document.getElementById('incomeDate').value,
        source: document.getElementById('incomeSource').value,
        amount: parseFloat(document.getElementById('incomeAmount').value),
        notes: document.getElementById('incomeNotes').value
    };
    
    if (currentEditId) {
        const index = incomeData.findIndex(item => item.id === currentEditId);
        incomeData[index] = incomeItem;
    } else {
        incomeData.push(incomeItem);
    }
    
    localStorage.setItem('incomeData', JSON.stringify(incomeData));
    renderIncomeTable();
    updateDashboard();
    renderCharts();
    closeIncomeModal();
});

function renderIncomeTable() {
    const tbody = document.getElementById('incomeTableBody');
    tbody.innerHTML = '';
    
    incomeData.forEach(income => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(income.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${income.source}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">$${income.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${income.notes}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openIncomeModal('${income.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteIncome('${income.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteIncome(id) {
    if (confirm('Are you sure you want to delete this income record?')) {
        incomeData = incomeData.filter(item => item.id !== id);
        localStorage.setItem('incomeData', JSON.stringify(incomeData));
        renderIncomeTable();
        updateDashboard();
        renderCharts();
    }
}

// Expense management
function openExpenseModal(id = null) {
    currentEditId = id;
    currentEditType = 'expense';
    
    if (id) {
        const expense = expenseData.find(item => item.id === id);
        document.getElementById('expenseDate').value = expense.date;
        document.getElementById('expenseCategory').value = expense.category;
        document.getElementById('expenseAmount').value = expense.amount;
        document.getElementById('expenseNotes').value = expense.notes;
        document.querySelector('#expenseModal h3').textContent = 'Edit Expense';
    } else {
        document.getElementById('expenseForm').reset();
        document.getElementById('expenseDate').value = new Date().toISOString().split('T')[0];
        document.querySelector('#expenseModal h3').textContent = 'Add Expense';
    }
    
    document.getElementById('expenseModal').classList.remove('hidden');
}

function closeExpenseModal() {
    document.getElementById('expenseModal').classList.add('hidden');
    currentEditId = null;
    currentEditType = null;
}

document.getElementById('expenseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const expenseItem = {
        id: currentEditId || Date.now().toString(),
        date: document.getElementById('expenseDate').value,
        category: document.getElementById('expenseCategory').value,
        amount: parseFloat(document.getElementById('expenseAmount').value),
        notes: document.getElementById('expenseNotes').value
    };
    
    if (currentEditId) {
        const index = expenseData.findIndex(item => item.id === currentEditId);
        expenseData[index] = expenseItem;
    } else {
        expenseData.push(expenseItem);
    }
    
    localStorage.setItem('expenseData', JSON.stringify(expenseData));
    renderExpenseTable();
    updateDashboard();
    renderCharts();
    closeExpenseModal();
});

function renderExpenseTable() {
    const tbody = document.getElementById('expenseTableBody');
    tbody.innerHTML = '';
    
    expenseData.forEach(expense => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(expense.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${expense.category}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">$${expense.amount.toFixed(2)}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${expense.notes}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openExpenseModal('${expense.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteExpense('${expense.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteExpense(id) {
    if (confirm('Are you sure you want to delete this expense record?')) {
        expenseData = expenseData.filter(item => item.id !== id);
        localStorage.setItem('expenseData', JSON.stringify(expenseData));
        renderExpenseTable();
        updateDashboard();
        renderCharts();
    }
}

// Task management
function openTaskModal(id = null) {
    currentEditId = id;
    currentEditType = 'task';
    
    if (id) {
        const task = taskData.find(item => item.id == id);
        document.getElementById('taskDate').value = task.date;
        document.getElementById('taskClient').value = task.client;
        document.getElementById('taskProduct').value = task.product;
        document.getElementById('taskQuantity').value = task.quantity;
        document.getElementById('taskPrice').value = task.price;
        document.getElementById('taskTotal').value = task.total;
        document.getElementById('taskArea').value = task.area;
        document.getElementById('taskStatus').value = task.status;
        document.getElementById('taskDeadline').value = task.deadline;
        document.querySelector('#taskModal h3').textContent = 'Edit Order';
    } else {
        document.getElementById('taskForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('taskDate').value = today;
        document.getElementById('taskDeadline').value = today;
        document.querySelector('#taskModal h3').textContent = 'Add Order';
    }
    
    document.getElementById('taskModal').classList.remove('hidden');
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
    currentEditId = null;
    currentEditType = null;
}

document.getElementById('taskForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskItem = {
        id: currentEditId || Date.now().toString(),
        date: document.getElementById('taskDate').value,
        client: document.getElementById('taskClient').value,
        product: document.getElementById('taskProduct').value,
        quantity: parseFloat(document.getElementById('taskQuantity').value),
        price: parseFloat(document.getElementById('taskPrice').value),
        total: parseFloat(document.getElementById('taskTotal').value),
        area: document.getElementById('taskArea').value,
        status: document.getElementById('taskStatus').value,
        deadline: document.getElementById('taskDeadline').value
    };
    
    if (currentEditId) {
        const index = taskData.findIndex(item => item.id == currentEditId);
        taskData[index] = taskItem;
    } else {
        taskData.push(taskItem);
    }
    
    localStorage.setItem('taskData', JSON.stringify(taskData));
    renderTaskTable();
    renderPaymentTable();
    updateDashboard();
    closeTaskModal();
});

function renderTaskTable() {
    const tbody = document.getElementById('taskTableBody');
    tbody.innerHTML = '';
    
    taskData.forEach(task => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        
        const statusColors = {
            'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
            'in-progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
            'completed': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        };
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(task.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${task.client}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${task.product}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${task.quantity}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">$${task.price.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">$${task.total.toFixed(2)}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${task.area}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status]}">
                    ${task.status.charAt(0).toUpperCase() + task.status.slice(1).replace('-', ' ')}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(task.deadline).toLocaleDateString()}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="openTaskModal('${task.id}')" class="text-blue-600 hover:text-blue-900 mr-3">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteTask('${task.id}')" class="text-red-600 hover:text-red-900">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteTask(id) {
    if (confirm('Are you sure you want to delete this order?')) {
        taskData = taskData.filter(item => item.id !== id);
        localStorage.setItem('taskData', JSON.stringify(taskData));
        renderTaskTable();
        renderPaymentTable();
        updateDashboard();
    }
}

// Payment management
function openPaymentModal(id = null) {
    currentEditId = id;
    currentEditType = 'payment';
    
    if (id) {
        const payment = paymentData.find(item => item.id === id);
        document.getElementById('paymentClient').value = payment.client;
        document.getElementById('paymentProduct').value = payment.product;
        document.getElementById('paymentAmount').value = payment.amount;
        document.getElementById('paymentReceived').value = payment.received;
        document.getElementById('paymentType').value = payment.type;
        document.querySelector('#paymentModal h3').textContent = 'Edit Payment';
    } else {
        document.getElementById('paymentForm').reset();
        document.querySelector('#paymentModal h3').textContent = 'Add Payment';
    }
    
    document.getElementById('paymentModal').classList.remove('hidden');
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
    currentEditId = null;
    currentEditType = null;
}

document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const paymentItem = {
        id: currentEditId || Date.now().toString(),
        client: document.getElementById('paymentClient').value,
        product: document.getElementById('paymentProduct').value,
        amount: parseFloat(document.getElementById('paymentAmount').value),
        received: parseFloat(document.getElementById('paymentReceived').value),
        type: document.getElementById('paymentType').value
    };
    
    if (currentEditId) {
        const index = paymentData.findIndex(item => item.id === currentEditId);
        paymentData[index] = paymentItem;
    } else {
        paymentData.push(paymentItem);
    }
    
    localStorage.setItem('paymentData', JSON.stringify(paymentData));
    renderPaymentTable();
    updateDashboard();
    renderCharts();
    closePaymentModal();
});

function renderPaymentTable() {
    const tbody = document.getElementById('paymentTableBody');
    tbody.innerHTML = '';
    
    taskData.forEach(order => {
        const row = document.createElement('tr');
        row.className = 'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors';
        
        // Find payment data for this order
        const payment = paymentData.find(p => p.orderId === order.id) || { advance: 0 };
        const advanceAmount = parseFloat(payment.advance) || 0;
        const pendingAmount = order.total - advanceAmount;
        const status = pendingAmount <= 0 ? 'Paid' : 'Pending';
        const statusColor = status === 'Paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">${new Date(order.date).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${order.client}</td>
            <td class="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">${order.product}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">$${order.total.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">$${advanceAmount.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">$${pendingAmount.toFixed(2)}</td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-medium rounded-full ${statusColor}">
                    ${status}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button onclick="updateAdvancePayment('${order.id}', '${order.client}', '${order.product}', ${order.total}, ${advanceAmount})" class="text-blue-600 hover:text-blue-900">
                    <i class="fas fa-edit"></i> Update Payment
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateAdvancePayment(orderId, client, product, total, currentAdvance) {
    const newAdvance = prompt(`Update advance payment for ${client} - ${product}\nTotal Amount: $${parseFloat(total).toFixed(2)}\nCurrent Advance: $${parseFloat(currentAdvance).toFixed(2)}\n\nEnter new advance amount:`, currentAdvance);
    
    if (newAdvance !== null && newAdvance !== '' && !isNaN(newAdvance)) {
        const advance = parseFloat(newAdvance);
        const totalAmount = parseFloat(total);
        
        if (advance >= 0 && advance <= totalAmount) {
            // Find existing payment record or create new one
            let existingPaymentIndex = -1;
            for (let i = 0; i < paymentData.length; i++) {
                if (paymentData[i].orderId == orderId) {
                    existingPaymentIndex = i;
                    break;
                }
            }
            
            if (existingPaymentIndex >= 0) {
                paymentData[existingPaymentIndex].advance = advance;
            } else {
                paymentData.push({
                    id: Date.now().toString(),
                    orderId: orderId,
                    advance: advance
                });
            }
            
            localStorage.setItem('paymentData', JSON.stringify(paymentData));
            renderPaymentTable();
            updateDashboard();
            renderCharts();
        } else {
            alert('Advance amount must be between $0 and the total amount ($' + totalAmount.toFixed(2) + ').');
        }
    }
}

function deletePayment(id) {
    if (confirm('Are you sure you want to delete this payment record?')) {
        paymentData = paymentData.filter(item => item.id !== id);
        localStorage.setItem('paymentData', JSON.stringify(paymentData));
        renderPaymentTable();
        updateDashboard();
        renderCharts();
    }
}

// Settings management
function renderSettingsLists() {
    renderCategoryList('incomeSourcesList', incomeSources, 'removeIncomeSource');
    renderCategoryList('expenseCategoriesList', expenseCategories, 'removeExpenseCategory');
    renderCategoryList('taskCategoriesList', taskCategories, 'removeTaskCategory');
    renderCategoryList('paymentTypesList', paymentTypes, 'removePaymentType');
    renderCategoryList('productsList', productList, 'removeProduct');
}

function renderCategoryList(containerId, items, removeFunction) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg';
        div.innerHTML = `
            <span class="text-sm text-gray-700 dark:text-gray-300">${item}</span>
            <button onclick="${removeFunction}(${index})" class="text-red-600 hover:text-red-800">
                <i class="fas fa-times"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

function addIncomeSource() {
    const input = document.getElementById('newIncomeSource');
    const value = input.value.trim();
    if (value && !incomeSources.includes(value)) {
        incomeSources.push(value);
        localStorage.setItem('incomeSources', JSON.stringify(incomeSources));
        renderSettingsLists();
        populateDropdowns();
        input.value = '';
    }
}

function removeIncomeSource(index) {
    incomeSources.splice(index, 1);
    localStorage.setItem('incomeSources', JSON.stringify(incomeSources));
    renderSettingsLists();
    populateDropdowns();
}

function addExpenseCategory() {
    const input = document.getElementById('newExpenseCategory');
    const value = input.value.trim();
    if (value && !expenseCategories.includes(value)) {
        expenseCategories.push(value);
        localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
        renderSettingsLists();
        populateDropdowns();
        input.value = '';
    }
}

function removeExpenseCategory(index) {
    expenseCategories.splice(index, 1);
    localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories));
    renderSettingsLists();
    populateDropdowns();
}

function addTaskCategory() {
    const input = document.getElementById('newTaskCategory');
    const value = input.value.trim();
    if (value && !taskCategories.includes(value)) {
        taskCategories.push(value);
        localStorage.setItem('taskCategories', JSON.stringify(taskCategories));
        renderSettingsLists();
        input.value = '';
    }
}

function removeTaskCategory(index) {
    taskCategories.splice(index, 1);
    localStorage.setItem('taskCategories', JSON.stringify(taskCategories));
    renderSettingsLists();
}

function addPaymentType() {
    const input = document.getElementById('newPaymentType');
    const value = input.value.trim();
    if (value && !paymentTypes.includes(value)) {
        paymentTypes.push(value);
        localStorage.setItem('paymentTypes', JSON.stringify(paymentTypes));
        renderSettingsLists();
        populateDropdowns();
        input.value = '';
    }
}

function removePaymentType(index) {
    paymentTypes.splice(index, 1);
    localStorage.setItem('paymentTypes', JSON.stringify(paymentTypes));
    renderSettingsLists();
    populateDropdowns();
}

function addProduct() {
    const input = document.getElementById('newProduct');
    const value = input.value.trim();
    if (value && !productList.includes(value)) {
        productList.push(value);
        localStorage.setItem('productList', JSON.stringify(productList));
        renderSettingsLists();
        populateDropdowns();
        input.value = '';
    }
}

function removeProduct(index) {
    productList.splice(index, 1);
    localStorage.setItem('productList', JSON.stringify(productList));
    renderSettingsLists();
    populateDropdowns();
}

// Render all tables
function renderAllTables() {
    renderIncomeTable();
    renderExpenseTable();
    renderTaskTable();
    renderPaymentTable();
}

// Close modals when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-backdrop')) {
        closeIncomeModal();
        closeExpenseModal();
        closeTaskModal();
        closePaymentModal();
        closeDetailModal();
    }
});

// Responsive sidebar for mobile
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    
    if (window.innerWidth < 768) {
        sidebar.classList.add('sidebar-collapsed');
        sidebar.classList.remove('sidebar-expanded');
        mainContent.classList.add('ml-16');
        mainContent.classList.remove('ml-64');
    }
});