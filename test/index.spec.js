const { describe } = require("node:test");
const { handler } = require("../index.js");

/******Mocks******** */
const Items = [
  { productId: "1", productName: "product 1" },
  { productId: "2", productName: "product 2" },
  { productId: "3", productName: "product 3" },
];

//mock aws
jest.mock("aws-sdk", () => {
  mockDocumentClient = {
    scan: jest.fn().mockReturnThis(),
    get: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };
  const mockDynamoDB = { DocumentClient: jest.fn(() => mockDocumentClient) };

  return {
    DynamoDB: mockDynamoDB,
    config: {
      update() {
        return {};
      },
    },
  };
});

/**************** */

describe("getProducts", () => {
  it("should return all products", async () => {
    mockDocumentClient.promise.mockResolvedValue({ Items })
    const event = {
      httpMethod: "OPTIONS",
      path: "/products",
    };
    expect(await handler(event)).toEqual({
      statusCode: 501,
      body: JSON.stringify('Unknown Method'),
      headers: {'Content-Type': 'application/json'}
    })
  });
});


describe("getProducts", () => {
  it("should return all products", async () => {
    mockDocumentClient.promise.mockResolvedValue({ Items }) 

    const event = {
      httpMethod: "GET",
      path: "/products",
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'findAllproducts',
      Message: 'Products Found',
      Products: Items
    }));
  });
});

describe("getProduct", () => {
  it("should return a product", async () => {
    mockDocumentClient.promise.mockResolvedValue({ Item: Items[0] }) 

    const event = {
      httpMethod: "GET",
      path: "/product",
      queryStringParameters: {
        productId: 1
      }
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'findByproductId',
      Message: 'Product Found',
      Product: Items[0]
    }));
  });
});


describe("getProduct", () => {
  it("should return a product failed error", async () => {
    const productId = 4;
    mockDocumentClient.promise.mockResolvedValue({ productId }) 

    const event = {
      httpMethod: "GET",
      path: "/product",
      queryStringParameters: {
        productId: productId
      }
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(404);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'findByproductId',
      Message: 'Error Getting Product Not Found',
      Error: `Product with ID ${productId} not found`
    }));
  });
});

describe("getProduct", () => {
  it("should return a product failed error Internal Server", async () => {
    const productId = { price: 1000};
    mockDocumentClient.promise.mockResolvedValue() 
    const event = {
      httpMethod: "GET",
      path: "/product",
      queryStringParameters: {
        productId: productId
      }
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(undefined);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'findByproductId',
      Message: 'Error Getting Product',
      Error: {}
    }));
  });
});



describe("createProduct", () => {
  test('should create new product', async () => {
    const newProduct = { productId: "4", productName: "product 4" };
    mockDocumentClient.promise.mockResolvedValue({ newProduct }) 

    const event = {
      httpMethod: "POST",
      path: "/product",
      body: JSON.stringify(newProduct)
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'createProduct',
      Message: 'Product Created Successfully',
      Product: newProduct
    }));

  });
});


describe("createProduct", () => {
  test('should return error when creating new product', async () => {
    const newProduct = { productId: "1", productName: "product 1" };
    
    mockDocumentClient.promise.mockRejectedValue( new Error('Error Saving Product')) 

    const event = {
      httpMethod: "POST",
      path: "/product",
      body: JSON.stringify(newProduct)
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(undefined);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'createProduct',
      Message: 'Error Saving Product',
      Error: {}
    }));

  });
});


describe("updateProduct", () => {
  test('should update a product', async () => {
    const updatedProduct = { productId: "1", productName: "product 1 updated" };
    mockDocumentClient.promise.mockResolvedValue({ updatedProduct }) 

    const event = {
      httpMethod: "PUT",
      path: "/product",
      body: JSON.stringify(updatedProduct)
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'updateProduct',
      Message: 'Product Updated Successfully',
      Product: updatedProduct
    }));

  });
});

describe("updateProduct", () => {
  test('should return error whenupdate a product', async () => {
    const updatedProduct = { productId: "1", productName: "product 1 updated" };
    mockDocumentClient.promise.mockRejectedValue( new Error('Error Updating Product')) 

    const event = {
      httpMethod: "PUT",
      path: "/product",
      body: JSON.stringify(updatedProduct)
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(undefined);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'updateProduct',
      Message: 'Error Updating Product',
      Error: {}
    }));

  });
});


describe("deleteProduct", () => {
  test('should delete a product', async () => {
    const productId = { productId: "1"};
    mockDocumentClient.promise.mockResolvedValue({productId}) 

    const event = {
      httpMethod: "DELETE",
      path: "/product",
      body: JSON.stringify({ productId })
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'deleteProduct',
      Message: 'Product Deleted Successfully',
      Product: productId
    }));

  });
});


describe("deleteProduct", () => {
  test('should return error delete a product', async () => {
    const productId = { productId: "1"};
    mockDocumentClient.promise.mockRejectedValue( new Error('Error Deleting Product')) 

    const event = {
      httpMethod: "DELETE",
      path: "/product",
      body: JSON.stringify({ productId })
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(undefined);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'deleteProduct',
      Message: 'Error Deleting Product',
      Error: {}
    }));

  });
});



describe("modifyProduct", () => {
  test('should modify a product', async () => {
    const productId = { productId: "1"};
    mockDocumentClient.promise.mockResolvedValue({productId}) 

    const event = {
      httpMethod: "PATCH",
      path: "/product",
      body: JSON.stringify({ productId })
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(200);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'modifyProduct',
      Message: 'Product Modified Successfully',
      Product: productId
    }));

  });
});

describe("modifyProduct", () => {
  test('should return error modify a product', async () => {
    const productId = { productId: "1"};
    mockDocumentClient.promise.mockRejectedValue( new Error('Error Modified Product')) 

    const event = {
      httpMethod: "PATCH",
      path: "/product",
      body: JSON.stringify({ productId })
    };

    const result = await handler(event);

    console.log("Results:", result);

    expect(result.statusCode).toBe(undefined);
    expect(result.body).toBe(JSON.stringify({
      Operation: 'modifyProduct',
      Message: 'Error Modified Product',
      Error: {}
    }));

  });
});
