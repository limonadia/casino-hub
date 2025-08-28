function Balance({ balance }: { balance: number }){

    return (
        <>
            <div className="flex items-center rounded-full bg-background-lighter p-2 text-casinoPink gap-2">
                <span className="material-symbols-outlined">poker_chip</span> <span className="text-white">{balance.toLocaleString()}</span>
                <div className="rounded-full bg-casinoPink p-3 text-white flex items-center">
                    <span className="material-symbols-outlined text-white"> wallet</span> Wallet
                </div>
            </div>
        </>
    );
}

export default Balance;