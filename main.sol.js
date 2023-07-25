const { expect } = require("chai");

describe("Treasury Contract", function () {
    let Treasury, IERC20, IProtocol, treasury, token, protocol, owner, addr1;

    beforeEach(async function () {
        // Get the ContractFactory and Signers here.
        Treasury = await ethers.getContractFactory("Treasury");
        IERC20 = await ethers.getContractFactory("IERC20");
        IProtocol = await ethers.getContractFactory("IProtocol");

        // Deploy the contracts and get references to them
        token = await IERC20.deploy();
        protocol = await IProtocol.deploy(token.address);
        treasury = await Treasury.deploy([protocol.address]);

        // Get Signers
        [owner, addr1] = await ethers.getSigners();
    });

    it("Should deposit the correct amount", async function () {
        // Mint some tokens to the owner and approve the treasury contract
        await token.mint(owner.address, 1000);
        await token.approve(treasury.address, 500);

        // Call the deposit function
        await treasury.deposit(token.address, 500);

        // Check the balance of the treasury contract
        const balance = await token.balanceOf(treasury.address);
        expect(balance).to.equal(500);
    });

    it("Should set allocation correctly", async function () {
        // Set allocation for the protocol
        await treasury.setAllocation(protocol.address, 50);

        // Get the allocation from the contract and check it
        const allocation = await treasury.allocations(protocol.address);
        expect(allocation).to.equal(50);
    });

    it("Should withdraw correctly", async function () {
        // Deposit some tokens first
        await token.mint(owner.address, 1000);
        await token.approve(treasury.address, 1000);
        await treasury.deposit(token.address, 1000);

        // Set allocation and distribute funds to protocol
        await treasury.setAllocation(protocol.address, 100);
        await treasury.distribute(token.address, 1000);

        // Withdraw from the protocol
        await treasury.withdraw(protocol.address, token.address, 500);

        // Check the balance of the treasury contract
        const balance = await token.balanceOf(treasury.address);
        expect(balance).to.equal(500);
    });

    it("Should calculate yield correctly", async function () {
        // Assuming the yield is set in the protocol contract
        await protocol.setYield(10);

        // Calculate yield from the treasury contract
        const totalYield = await treasury.calculateYield();

        // Check the yield
        expect(totalYield).to.equal(10);
    });
});
