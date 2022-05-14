import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { FoodService } from '../food/food.service';
import { RatingService } from '../rating/rating.service';
import { TransactionService } from '../transaction/transaction.service';
import { UserService } from '../user/user.service';
import { ApiController } from './api.controller';
import { ApiService } from './api.service';

const listOfFoods = [
  {
    _id: 'dqnqjdn123',
    name: 'Mie Goreng Indomie',
    description: 'something long text',
    ingredients: ['a', 'b', 'c'],
    price: 12345,
    rate: 5.0,
    picturePath: '/images/null.png',
    rateCount: 123,
    orderCount: 123,
    date: new Date().toLocaleDateString(),
  },
  {
    _id: 'dqnqjdn345',
    name: 'Soto Padang',
    description: 'something long text',
    ingredients: ['a', 'b', 'c'],
    price: 12345,
    rate: 5.0,
    picturePath: '/images/null.png',
    rateCount: 123,
    orderCount: 123,
    date: new Date().toLocaleDateString(),
  },
];

describe('ApiController', () => {
  let apiController: ApiController;
  let userService: UserService;
  let authService: AuthService;
  let foodService: FoodService;
  let ratingService: RatingService;
  let transactionService: TransactionService;
  let apiService: ApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiController],
      providers: [
        {
          provide: UserService,
          useValue: {
            checkEmail: () => null,
            register: () => null,
            login: () => null,
            checkId: () => null,
            editUser: () => null,
          },
        },
        {
          provide: AuthService,
          useValue: {
            createToken: () => null,
            generateRefreshToken: () => null,
            createAccessTokenFromRefreshToken: () => null,
          },
        },
        {
          provide: FoodService,
          useValue: {
            getAll: jest.fn().mockResolvedValue(listOfFoods),
            getById: () => null,
            updateFoodOrder: () => null,
            updateFoodRate: () => null,
          },
        },
        {
          provide: TransactionService,
          useValue: {
            addOrder: () => null,
            addTransaction: () => null,
            updateOrder: () => null,
            getTransactionByUserId: () => null,
            getTransaction: () => null,
            getOrderById: () => null,
            cancelTransaction: () => null,
            changeOrderProgress: () => null,
          },
        },
        {
          provide: RatingService,
          useValue: {
            checkRating: () => null,
            addRate: () => null,
          },
        },
        {
          provide: ApiService,
          useValue: {
            sendMessage: () => null,
          },
        },
      ],
    }).compile();

    apiController = module.get<ApiController>(ApiController);
    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    foodService = module.get<FoodService>(FoodService);
    ratingService = module.get<RatingService>(RatingService);
    transactionService = module.get<TransactionService>(TransactionService);
    apiService = module.get<ApiService>(ApiService);
  });

  it('should be defined', () => {
    expect(apiController).toBeDefined();
    expect(userService).toBeDefined();
    expect(authService).toBeDefined();
    expect(foodService).toBeDefined();
    expect(ratingService).toBeDefined();
    expect(transactionService).toBeDefined();
    expect(apiService).toBeDefined();
  });

  describe('getAllFood', () => {
    it('should return an array of foods', async () => {
      const res = {
        val: [],
        statusCode: 0,
        json: function (body?: any) {
          this.val = body;
          return this.val;
        },
        status: function (code: number) {
          this.statusCode = code;
          if (this.val.length > 0) return this.val;
          return this;
        },
      } as any as Response;
      expect(await apiController.getAllFood(res)).toEqual(listOfFoods);
    });
  });
});
