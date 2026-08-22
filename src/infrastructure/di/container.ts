import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';

import { MockTransactionRepository } from '../mock/MockTransactionRepository';
import { MockWalletRepository } from '../mock/MockWalletRepository';
import { MockBudgetRepository } from '../mock/MockBudgetRepository';

import { GetFinancialSummaryUseCase } from '@/application/usecases/GetFinancialSummary';
import { GetTransactionsUseCase } from '@/application/usecases/GetTransactions';
import { GetWalletsUseCase } from '@/application/usecases/GetWallets';
import { GetBudgetsUseCase } from '@/application/usecases/GetBudgets';
import { CreateTransactionUseCase } from '@/application/usecases/CreateTransaction';
import { CreateWallet } from '@/application/usecases/CreateWallet';
import { UpdateWallet } from '@/application/usecases/UpdateWallet';
import { DeleteWallet } from '@/application/usecases/DeleteWallet';

class Container {
  private transactionRepository!: ITransactionRepository;
  private walletRepository!: IWalletRepository;
  private budgetRepository!: IBudgetRepository;

  constructor() {
    this.initRepositories();
  }

  private initRepositories() {
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

    if (isMock) {
      this.transactionRepository = new MockTransactionRepository();
      this.walletRepository = new MockWalletRepository();
      this.budgetRepository = new MockBudgetRepository();
    } else {
      // Future API Implementations when Backend is ready:
      // this.transactionRepository = new ApiTransactionRepository();
      // this.walletRepository = new ApiWalletRepository();
      // this.budgetRepository = new ApiBudgetRepository();
      throw new Error(
        'Backend API repositories are not configured yet. Set NEXT_PUBLIC_USE_MOCK=true'
      );
    }
  }

  // Use Case Factories
  public getFinancialSummaryUseCase(): GetFinancialSummaryUseCase {
    return new GetFinancialSummaryUseCase(this.transactionRepository);
  }

  public getTransactionsUseCase(): GetTransactionsUseCase {
    return new GetTransactionsUseCase(this.transactionRepository);
  }

  public getWalletsUseCase(): GetWalletsUseCase {
    return new GetWalletsUseCase(this.walletRepository);
  }

  public getBudgetsUseCase(): GetBudgetsUseCase {
    return new GetBudgetsUseCase(this.budgetRepository);
  }

  public getCreateTransactionUseCase(): CreateTransactionUseCase {
    return new CreateTransactionUseCase(
      this.transactionRepository,
      this.walletRepository
    );
  }

  public getCreateWalletUseCase(): CreateWallet {
    return new CreateWallet(this.walletRepository);
  }

  public getUpdateWalletUseCase(): UpdateWallet {
    return new UpdateWallet(this.walletRepository);
  }

  public getDeleteWalletUseCase(): DeleteWallet {
    return new DeleteWallet(this.walletRepository);
  }
}

export const container = new Container();
