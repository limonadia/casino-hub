function SlotMachine({ balance, setBalance }: { balance: number; setBalance: any }) {
    const handlePlay = () => {
      const win = Math.random() < 0.5 ? 10 : -5; // random win/loss
      setBalance(balance + win);
    };
  
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Slot Machine 🎰</h2>
        <p>Balance: ${balance}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={handlePlay}
        >
          Play
        </button>
      </div>
    );
  }

  export default SlotMachine;