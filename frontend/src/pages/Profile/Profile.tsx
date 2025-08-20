function Profile({ balance, setBalance }: { balance: number; setBalance: any }) {
    return (
    <div className="p-6 text-center">
    <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
    <p className="mb-4">Current Balance: 💰 {balance}</p>
    <button
    onClick={() => setBalance(1000)}
    className="bg-green-600 text-white px-4 py-2 rounded-xl shadow"
    >
    Reset Balance
    </button>
    </div>
    );
    }

    export default Profile;