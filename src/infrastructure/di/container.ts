import { ITransactionRepository } from '@/domain/repositories/ITransactionRepository';
import { IWalletRepository } from '@/domain/repositories/IWalletRepository';
import { IBudgetRepository } from '@/domain/repositories/IBudgetRepository';
import { IBillRepository } from '@/domain/repositories/IBillRepository';
import { INotificationRepository } from '@/domain/repositories/INotificationRepository';

import { MockTransactionRepository } from '../mock/MockTransactionRepository';
import { MockWalletRepository } from '../mock/MockWalletRepository';
import { MockBudgetRepository } from '../mock/MockBudgetRepository';
import { MockBillRepository } from '../mock/MockBillRepository';
import { MockNotificationRepository } from '../mock/MockNotificationRepository';

import { ApiTransactionRepository } from '../api/ApiTransactionRepository';
import { ApiWalletRepository } from '../api/ApiWalletRepository';
import { ApiBudgetRepository } from '../api/ApiBudgetRepository';
import { ApiBillRepository } from '../api/ApiBillRepository';
import { ApiNotificationRepository } from '../api/ApiNotificationRepository';

import { GetFinancialSummaryUseCase } from '@/application/usecases/GetFinancialSummary';
import { GetTransactionsUseCase } from '@/application/usecases/GetTransactions';
import { GetWalletsUseCase } from '@/application/usecases/GetWallets';
import { GetBudgetsUseCase } from '@/application/usecases/GetBudgets';
import { CreateBudgetUseCase } from '@/application/usecases/CreateBudget';
import { UpdateBudgetUseCase } from '@/application/usecases/UpdateBudget';
import { DeleteBudgetUseCase } from '@/application/usecases/DeleteBudget';
import { GetBillsUseCase } from '@/application/usecases/GetBills';
import { CreateBillUseCase } from '@/application/usecases/CreateBill';
import { UpdateBillUseCase } from '@/application/usecases/UpdateBill';
import { DeleteBillUseCase } from '@/application/usecases/DeleteBill';
import { PayBillUseCase } from '@/application/usecases/PayBill';
import { CreateTransactionUseCase } from '@/application/usecases/CreateTransaction';
import { UpdateTransactionUseCase } from '@/application/usecases/UpdateTransaction';
import { DeleteTransactionUseCase } from '@/application/usecases/DeleteTransaction';
import { TransferFundsUseCase } from '@/application/usecases/TransferFunds';
import { CreateWallet } from '@/application/usecases/CreateWallet';
import { UpdateWallet } from '@/application/usecases/UpdateWallet';
import { DeleteWallet } from '@/application/usecases/DeleteWallet';
import {
  GetNotificationsUseCase,
  GetUnreadCountUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
  DeleteNotificationUseCase,
  ClearReadNotificationsUseCase,
  GetNotificationSettingsUseCase,
  UpdateNotificationSettingsUseCase,
  RequestPhoneOTPUseCase,
  ConfirmPhoneOTPUseCase,
} from '@/application/usecases/NotificationUseCases';

class Container {
  private transactionRepository!: ITransactionRepository;
  private walletRepository!: IWalletRepository;
  private budgetRepository!: IBudgetRepository;
  private billRepository!: IBillRepository;
  private notificationRepository!: INotificationRepository;

  constructor() {
    this.initRepositories();
  }

  private initRepositories() {
    const isMock = process.env.NEXT_PUBLIC_USE_MOCK === 'true' || process.env.NODE_ENV === 'test';

    if (isMock) {
      this.transactionRepository = new MockTransactionRepository();
      this.walletRepository = new MockWalletRepository();
      this.budgetRepository = new MockBudgetRepository();
      this.billRepository = new MockBillRepository();
      this.notificationRepository = new MockNotificationRepository();
    } else {
      // Production REST API Real Backend:
      this.transactionRepository = new ApiTransactionRepository();
      this.walletRepository = new ApiWalletRepository();
      this.budgetRepository = new ApiBudgetRepository();
      this.billRepository = new ApiBillRepository();
      this.notificationRepository = new ApiNotificationRepository();
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

  public getCreateBudgetUseCase(): CreateBudgetUseCase {
    return new CreateBudgetUseCase(this.budgetRepository);
  }

  public getUpdateBudgetUseCase(): UpdateBudgetUseCase {
    return new UpdateBudgetUseCase(this.budgetRepository);
  }

  public getDeleteBudgetUseCase(): DeleteBudgetUseCase {
    return new DeleteBudgetUseCase(this.budgetRepository);
  }

  public getBillsUseCase(): GetBillsUseCase {
    return new GetBillsUseCase(this.billRepository);
  }

  public getCreateBillUseCase(): CreateBillUseCase {
    return new CreateBillUseCase(this.billRepository);
  }

  public getUpdateBillUseCase(): UpdateBillUseCase {
    return new UpdateBillUseCase(this.billRepository);
  }

  public getDeleteBillUseCase(): DeleteBillUseCase {
    return new DeleteBillUseCase(this.billRepository);
  }

  public getPayBillUseCase(): PayBillUseCase {
    return new PayBillUseCase(this.billRepository);
  }

  public getCreateTransactionUseCase(): CreateTransactionUseCase {
    return new CreateTransactionUseCase(
      this.transactionRepository,
      this.walletRepository
    );
  }

  public getUpdateTransactionUseCase(): UpdateTransactionUseCase {
    return new UpdateTransactionUseCase(
      this.transactionRepository,
      this.walletRepository
    );
  }

  public getDeleteTransactionUseCase(): DeleteTransactionUseCase {
    return new DeleteTransactionUseCase(
      this.transactionRepository,
      this.walletRepository
    );
  }

  public getTransferFundsUseCase(): TransferFundsUseCase {
    return new TransferFundsUseCase(
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

  public getNotificationsUseCase(): GetNotificationsUseCase {
    return new GetNotificationsUseCase(this.notificationRepository);
  }

  public getUnreadCountUseCase(): GetUnreadCountUseCase {
    return new GetUnreadCountUseCase(this.notificationRepository);
  }

  public getMarkNotificationReadUseCase(): MarkNotificationReadUseCase {
    return new MarkNotificationReadUseCase(this.notificationRepository);
  }

  public getMarkAllNotificationsReadUseCase(): MarkAllNotificationsReadUseCase {
    return new MarkAllNotificationsReadUseCase(this.notificationRepository);
  }

  public getDeleteNotificationUseCase(): DeleteNotificationUseCase {
    return new DeleteNotificationUseCase(this.notificationRepository);
  }

  public getClearReadNotificationsUseCase(): ClearReadNotificationsUseCase {
    return new ClearReadNotificationsUseCase(this.notificationRepository);
  }

  public getNotificationSettingsUseCase(): GetNotificationSettingsUseCase {
    return new GetNotificationSettingsUseCase(this.notificationRepository);
  }

  public getUpdateNotificationSettingsUseCase(): UpdateNotificationSettingsUseCase {
    return new UpdateNotificationSettingsUseCase(this.notificationRepository);
  }

  public getRequestPhoneOTPUseCase(): RequestPhoneOTPUseCase {
    return new RequestPhoneOTPUseCase(this.notificationRepository);
  }

  public getConfirmPhoneOTPUseCase(): ConfirmPhoneOTPUseCase {
    return new ConfirmPhoneOTPUseCase(this.notificationRepository);
  }
}

export const container = new Container();
