import React, { useState, useEffect } from 'react';
import { 
  View, 
  RefreshControl,
  Platform,
  Alert,
  TouchableWithoutFeedback,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { InvestmentForm } from '../components/forms/InvestmentForm';
import { InvestmentCard } from '../components/list/InvestmentCard';
import { generateUUID } from '../utils/uuid';
import { formatCurrency } from '../utils/currency';
import { ScreenHeader } from '../components/common/ScreenHeader';
import { AddItemButton } from '../components/common/AddItemButton';
import { FormModal } from '../components/common/FormModal';
import { SummaryCard } from '../components/common/SummaryCard';
import { EmptyState } from '../components/common/EmptyState';
import { ListContainer } from '../components/common/ListContainer';

interface Investment {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  price: number;
  purchasePrice: number;
  notes?: string;
}

const InvestmentsScreen = () => {
  const { database, isLoading } = useApp();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [totalGain, setTotalGain] = useState(0);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editInvestment, setEditInvestment] = useState<Investment | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const fetchInvestments = async () => {
    if (!database) return;
    const allInvestments = await database.investments.find().exec();
    const investmentsList = allInvestments.map(inv => ({
      id: inv.id,
      symbol: inv.symbol,
      name: inv.name,
      shares: inv.shares,
      price: inv.price,
      purchasePrice: inv.purchasePrice,
      notes: inv.notes,
    }));
    
    setInvestments(investmentsList);
    
    // Calculate totals
    const value = investmentsList.reduce((sum, inv) => 
      sum + (inv.price * inv.shares), 0);
    const cost = investmentsList.reduce((sum, inv) => 
      sum + (inv.purchasePrice * inv.shares), 0);
    
    setTotalValue(value);
    setTotalGain(value - cost);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInvestments();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchInvestments();
  }, [database]);

  const handleCreateInvestment = async (investmentData: Omit<Investment, 'id'>) => {
    if (!database) return;

    try {
      setIsSubmitting(true);

      if (editInvestment) {
        await database.investments.findOne(editInvestment.id).update({
          $set: {
            ...investmentData,
            lastUpdated: Date.now(),
          }
        });
      } else {
        const newInvestment = {
          ...investmentData,
          id: generateUUID('investment'),
          lastUpdated: Date.now(),
        };
        await database.investments.insert(newInvestment);
      }

      await fetchInvestments();
      setIsFormVisible(false);
      setEditInvestment(null);
    } catch (error) {
      console.error('Failed to save investment:', error);
      Alert.alert('Error', 'Failed to save investment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditInvestment = (investment: Investment) => {
    setEditInvestment(investment);
    setIsFormVisible(true);
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (!database) return;
    
    try {
      const investment = await database.investments.findOne(investmentId).exec();
      if (!investment) {
        throw new Error('Investment not found');
      }
      
      Alert.alert(
        'Delete Investment',
        'Are you sure you want to delete this investment? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                await investment.remove();
                await fetchInvestments();
              } catch (error) {
                console.error('Error deleting investment:', error);
                Alert.alert('Error', 'Failed to delete investment');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting investment:', error);
      Alert.alert('Error', 'Failed to delete investment');
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg text-neutral-700">Loading...</Text>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={() => setActiveMenuId(null)}>
      <View className="flex-1 bg-background">
        <ListContainer
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <ScreenHeader 
            title="Investments" 
            count={investments.length}
            countLabel="investments"
          />

          <SummaryCard
            title="Portfolio Value"
            value={formatCurrency(totalValue)}
            change={{
              value: totalGain,
              percentage: totalValue > 0 ? ((totalGain / (totalValue - totalGain)) * 100) : 0,
            }}
            type="investment"
          />

          <AddItemButton
            onPress={() => setIsFormVisible(true)}
            label="Add New Investment"
          />

          <View className="px-4 pb-6">
            {investments.length === 0 ? (
              <EmptyState
                icon="trending-up-outline"
                title="No investments added yet"
                description="Start building your portfolio by adding your first investment"
              />
            ) : (
              <View className="space-y-3">
                {investments.map((investment) => (
                  <InvestmentCard
                    key={investment.id}
                    investment={investment}
                    isMenuActive={activeMenuId === investment.id}
                    onToggleMenu={() => setActiveMenuId(activeMenuId === investment.id ? null : investment.id)}
                    onEdit={handleEditInvestment}
                    onDelete={handleDeleteInvestment}
                    formatCurrency={formatCurrency}
                  />
                ))}
              </View>
            )}
          </View>
        </ListContainer>

        <FormModal
          visible={isFormVisible}
          onClose={() => {
            setIsFormVisible(false);
            setEditInvestment(null);
          }}
          title={editInvestment ? 'Edit Investment' : 'Add New Investment'}
          isSubmitting={isSubmitting}
        >
          <InvestmentForm
            onSubmit={handleCreateInvestment}
            isLoading={isSubmitting}
            initialData={editInvestment}
            isEditMode={!!editInvestment}
          />
        </FormModal>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default InvestmentsScreen;
