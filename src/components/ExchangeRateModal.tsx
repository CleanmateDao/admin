import { useState, useEffect } from 'react';
import Modal from './Modal';

interface ExchangeRate {
  id?: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  rateToB3TR: string;
}

interface ExchangeRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ExchangeRate, 'id'>) => void;
  exchangeRate?: ExchangeRate | null;
  isLoading?: boolean;
}

export default function ExchangeRateModal({
  isOpen,
  onClose,
  onSave,
  exchangeRate,
  isLoading = false,
}: ExchangeRateModalProps) {
  const [formData, setFormData] = useState({
    currencyCode: '',
    currencyName: '',
    symbol: '',
    rateToB3TR: '',
  });

  useEffect(() => {
    if (exchangeRate) {
      setFormData({
        currencyCode: exchangeRate.currencyCode,
        currencyName: exchangeRate.currencyName,
        symbol: exchangeRate.symbol,
        rateToB3TR: exchangeRate.rateToB3TR,
      });
    } else {
      setFormData({
        currencyCode: '',
        currencyName: '',
        symbol: '',
        rateToB3TR: '',
      });
    }
  }, [exchangeRate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleClose = () => {
    setFormData({
      currencyCode: '',
      currencyName: '',
      symbol: '',
      rateToB3TR: '',
    });
    onClose();
  };

  const isEditMode = !!exchangeRate;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? 'Update Exchange Rate' : 'Add Exchange Rate'}
      size="medium"
    >
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="currency-code">Currency Code:</label>
          <input
            id="currency-code"
            type="text"
            value={formData.currencyCode}
            onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value.toUpperCase() })}
            required
            placeholder="USD"
            disabled={isLoading || isEditMode}
            maxLength={3}
            style={{ textTransform: 'uppercase' }}
          />
          {isEditMode && (
            <small style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginTop: '0.25rem' }}>
              Currency code cannot be changed
            </small>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="currency-name">Currency Name:</label>
          <input
            id="currency-name"
            type="text"
            value={formData.currencyName}
            onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
            required
            placeholder="US Dollar"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="symbol">Symbol:</label>
          <input
            id="symbol"
            type="text"
            value={formData.symbol}
            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
            required
            placeholder="$"
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="rate">Rate to B3TR:</label>
          <input
            id="rate"
            type="number"
            step="0.000001"
            value={formData.rateToB3TR}
            onChange={(e) => setFormData({ ...formData, rateToB3TR: e.target.value })}
            required
            placeholder="0.001"
            disabled={isLoading}
            min="0"
          />
          <small style={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginTop: '0.25rem' }}>
            How many units of this currency equal 1 B3TR
          </small>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? (isEditMode ? 'Updating...' : 'Adding...') : isEditMode ? 'Update' : 'Add'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

