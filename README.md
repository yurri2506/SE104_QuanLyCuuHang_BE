# 💎 Jewelry Store Management System

## 📘 Project Overview

This is the final project for the course **SE104 – Introduction to Software Engineering** at **University of Information Technology – VNU HCM**.  
The goal is to build a **jewelry store management system** that helps optimize business processes such as sales, inventory, services, warehouse, customer management, and reporting.

## 👨‍🏫 Instructor

- Dr. Đỗ Thị Thanh Tuyền

## 👥 Team Members – Group 12

| Full Name                | Student ID |
|--------------------------|------------|
| Trần Quốc Trung          | 22521569   |
| Nguyễn Lê Thanh Huyền    | 22520590   |
| Nguyễn Ngọc Thanh Tuyền  | 22521631   |
| Võ Thị Phương Uyên       | 22521645   |
| Nguyễn Minh Bảo          | 23520123   |

## 🧩 Key Features

- 🧾 Manage sales, purchases, and service invoices  
- 📦 Track inventory and goods import/export  
- 🧑‍🤝‍🧑 Manage customer information  
- 📊 Generate business and inventory reports  
- 🔐 User roles and permissions (Admin, staff, warehouse manager)  
- 📁 Import/export data using Excel files  
- ❌ Prevent editing/deleting invoices once created  
- ♻️ Support data recovery for deleted records  

## 🛠️ Technologies Used

- Languages: JavaScript / HTML / CSS  
- Backend: Node.js + Express  
- Database: MySQL  
- Architecture: 3-tier (Client - Web Server - Database Server)  
- Development model: Waterfall  
- Technique: Object-Oriented Programming (OOP)  

## ⚙️ System Architecture
- Client (Browser: Chrome/Firefox)
   - ↕️ (HTTP)
- Web Server (Node.js + Express)
   - ↕️ (SQL)
- Database Server (MySQL)

## 💽 Installation Guide

### 💻 System Requirements

- Node.js >= v16  
- MySQL >= 8.0  
- Modern web browser (Chrome/Edge)  
- Office suite that supports Excel  

### 🔧 Setup Instructions

1. Clone the repository:
    ```bash
    git clone https://github.com/yurri2506/SSE104_QuanLyCuuHang_FE.git
    cd jewelry-store-management
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a database and import `schema.sql` from the `/database` folder.

4. Update database configuration in the `.env` file.

5. Run the server:
    ```bash
    npm start
    ```

6. Open your browser and visit: [http://localhost:3000](http://localhost:3000)

## 🧪 Testing

- Unit testing: for data handling functions  
- Integration testing: sales – inventory – report flow  
- System testing: test all features via the UI  
- Demo data available for testing: `data/demo_data.xlsx`  

## 🧠 Achievements

- User-friendly and intuitive interface  
- Fully functional business management modules  
- Integrated security and detailed role permissions  
- Flexible data import/export features  

## 🌱 Future Development

- Barcode scanning integration  
- Electronic payment support  
- Mobile-responsive UI  
- Data analytics and smart import suggestions  
- Multi-branch store connection  

## 📚 References

- SE104 course materials – UIT  
- MySQL and Node.js documentation  
- System architecture and 3-tier design documentation  
- [W3Schools](https://www.w3schools.com/) – HTML, CSS, JS basics  

## 📄 License

This project is licensed for academic and educational purposes only.
