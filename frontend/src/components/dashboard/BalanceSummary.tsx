import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import type { Balance } from '../../types/expense';

interface BalanceSummaryProps {
  balances: Balance[];
  totalOwed: number;
  totalToReceive: number;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ 
  balances, 
  totalOwed, 
  totalToReceive 
}) => {
  const netBalance = totalToReceive - totalOwed;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Balance Summary</h2>
      
      {/* Overall Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingDown className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm text-red-600 font-medium">You Owe</p>
              <p className="text-2xl font-bold text-red-700">₹{totalOwed.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-green-600 font-medium">You're Owed</p>
              <p className="text-2xl font-bold text-green-700">₹{totalToReceive.toFixed(2)}</p>
            </div>
          </div>
        </div>
        
        <div className={`p-4 rounded-lg ${netBalance >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
          <div className="flex items-center">
            <DollarSign className={`w-8 h-8 mr-3 ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
            <div>
              <p className={`text-sm font-medium ${netBalance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                Net Balance
              </p>
              <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                ₹{Math.abs(netBalance).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Individual Balances */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Individual Balances</h3>
        <div className="space-y-3">
          {balances.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No outstanding balances</p>
          ) : (
            balances.map((balance) => (
              <div key={balance.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-medium text-sm">
                      {balance.userName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-medium text-gray-900">{balance.userName}</span>
                </div>
                
                <div className="text-right">
                  {balance.netBalance === 0 ? (
                    <span className="text-green-600 font-medium">Settled</span>
                  ) : balance.netBalance > 0 ? (
                    <div>
                      <span className="text-green-600 font-medium">
                        Owes you ₹{balance.netBalance.toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div>
                      <span className="text-red-600 font-medium">
                        You owe ₹{Math.abs(balance.netBalance).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;
