import { useTranslation } from "react-i18next";

function Balance({ balance }: { balance: number }){
    const { t } = useTranslation();


    return (
        <>
            <div className="flex items-center rounded-full bg-background-lighter p-2 text-casinoPink gap-2">
                <span className="material-symbols-outlined">poker_chip</span> <span className="text-white">{balance.toLocaleString()}</span>
                <div className="rounded-full bg-casinoPink p-3 text-white flex items-center">
                    <span className="material-symbols-outlined text-white"> wallet</span> {t("Wallet")}
                </div>
            </div>
        </>
    );
}

export default Balance;