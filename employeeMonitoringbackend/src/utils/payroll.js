const calculatePayroll = (input) => {
    const { baseRate, hoursWorked, overtimeHours = 0, deductions = 0, taxRate = 0.2 } = input;

    const baseSalary = baseRate * hoursWorked;
    const overtimePay = overtimeHours * baseRate * 1.5;
    const taxDeduction = (baseSalary + overtimePay) * taxRate;
    const netPay = baseSalary + overtimePay - taxDeduction - deductions;

    return {
        baseSalary: Math.round(baseSalary * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        taxDeduction: Math.round(taxDeduction * 100) / 100,
        deductions,
        netPay: Math.round(netPay * 100) / 100,
    };
};

module.exports = {
    calculatePayroll,
};
