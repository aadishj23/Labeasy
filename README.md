# Labeasy

Labeasy is a platform that connects blood collection centers and labs with users looking for affordable and accessible diagnostic tests. Designed especially for tier 2 and tier 3 labs, Labeasy provides an online presence, simplifies price comparisons, and offers unique services such as report storage on the Solana blockchain. It also provides valuable data for insurance companies to streamline premium calculations, creating a comprehensive ecosystem for labs, users, and insurers.


## Website
https://labeasy.aadish.tech/

## Features

1. **Lab and Test Listings**: Labs and collection centers can list themselves and add diagnostic tests with prices.
2. **User-Friendly Interface**: Users can easily browse and compare labs, prices, and available tests to make informed decisions.
3. **Blockchain-Powered Report Security**: Lab reports are securely stored on the Solana blockchain, ensuring integrity and preventing tampering.
4. **Health Dashboard**: Each user has a health dashboard with a health index calculated from past reports, useful for users and insurers alike.
5. **Insurance Integration**: The platform allows insurance companies to access a user's health index (with permission) to expedite premium calculations.
6. **Revenue Model**:
   - Sponsored ads for labs.
   - Commission on lab sales above specified thresholds.
   - Commissions from insurance sales via the platform.
7. **Future AI Integration**: Planned development of an AI feature to generate report summaries, offering users insights and suggesting doctor visits if needed.

## Tech Stack

- **Frontend**: React with Recoil for state management
- **Backend**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Blockchain**: Solana for secure report storage
- **UI Library**: Acternity UI for consistent and modern UI components

## Project Structure

- **frontend/**: Contains the frontend code, built with React and Recoil for state management.
- **backend/**: Contains the backend code, built with Express.js and Prisma for database interactions.
- **LabDetailsPopup Component**: Displays lab listings while maintaining cart functionality.
- **database/**: PostgreSQL database managed with Prisma for seamless integration and data handling.

## Pages

### 1. Home

![Home](https://drive.google.com/uc?id=1WDKnWV0erGIwXTbJdiwRmVUHHtfTnb6_)


### 2. Tests

![Tests](https://drive.google.com/uc?id=18LcJXQcHWqEfigVrj7_KZjHcc2FlWPaW)


### 3. Cart

![Cart](https://drive.google.com/uc?id=1576QFBgUUw8uzBbgWL_qzoQ2vI1ld6OA)


### 4. Results

![Results](https://drive.google.com/uc?id=1LZ-Rwc2zBHDAdHtkGjou2vZ-LtOKltl1)


### 5. Labs Dashboard

![Labs Dashboard](https://drive.google.com/uc?id=1xcnURi8frBq85BjJvKGk5FE59aP7gqji)


### 6. SignIn

![SignIn](https://drive.google.com/uc?id=1J5g_VrXPR4wCJZYBxkcfuz6PWKgvMmK6)


### 7. SignUp User

![SignUp User](https://drive.google.com/uc?id=1Zi_DWkE-EbvygPfLL8fX2d7DttJgrYEm)


### 8. SignUp Lab

![SignUp Lab](https://drive.google.com/uc?id=12GE6c5K0lx4axzoWbWXlScjyqY9T-v29)


## Getting Started

### Prerequisites

1. **Node.js** (v14 or higher)
2. **PostgreSQL**
3. **Prisma**

### Installation

1. **Clone the repository**:
    ```bash
    git clone https://github.com/yourusername/labeasy.git
    cd labeasy
    ```

2. **Install dependencies**:

    - Install backend dependencies:
      ```bash
      cd backend
      npm install
      ```

    - Install frontend dependencies:
      ```bash
      cd ../frontend
      npm install
      ```

3. **Setup Database**:
    - Create a PostgreSQL database.
    - Update the `.env` file in the backend with your database credentials.

    ```env
    DATABASE_URL="postgresql://username:password@localhost:5432/labeasy"
    ```

    - Run Prisma migrations:
      ```bash
      cd backend
      npx prisma migrate dev
      ```

4. **Blockchain Setup**:
    - Connect the backend to the Solana blockchain for report storage (API keys and configuration for Solana network required).

5. **Run the Application**:
    - Start the backend server:
      ```bash
      cd backend
      npm start
      ```
    - Start the frontend server:
      ```bash
      cd frontend
      npm run dev
      ```

6. **Access the Application**:
    - Open a browser and go to `http://localhost:3000` for the frontend.

## Usage

1. **User Registration and Login**: Users can sign up, browse labs, and view available tests and prices.
2. **Lab Listing and Test Management**: Labs can list tests and manage their information from the lab dashboard.
3. **Order Tests and Checkout**: Users can add tests to the cart and proceed to checkout with their selected options.
4. **View Health Dashboard**: Users can monitor their health index, based on blockchain-stored reports, visible on the health dashboard.
5. **Insurance Integration**: Insurance companies can access user data (with permission) to determine premiums based on health status.

## Future Scope

- **AI Model for Report Summaries**: Develop an AI that generates summaries and suggests next steps.
- **Doctor Referrals**: Integrate local doctor referrals to provide users with medical advice based on reports.
- **Enhanced Search and Filters**: Advanced filters and search options for finding specific labs or test types.
- **Mobile App**: Expand accessibility by developing a mobile app for Android and iOS.

## Contributing

Contributions are welcome! Please create a pull request for any enhancements, bug fixes, or new features.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.
