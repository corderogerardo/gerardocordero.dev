class LedgerEntry < ApplicationRecord
  belongs_to :payout, optional: true

  validates :account, presence: true
  validates :amount_cents, numericality: { only_integer: true, other_than: 0 }

  scope :for_account, ->(account) { where(account: account) }

  def self.balance_for(account)
    for_account(account).sum(:amount_cents)
  end
end
