<div className="row">
          <div className="col-lg-1-24">
            <div class="col-lg-1-12">
          <div>
          <div className="index">
          <ToastContainer />
          </div>
            <h1 className="text-center">Hello World</h1>
                <h2>Your Account:</h2>
                    <AccountData 
                        drizzle={drizzle} 
                        drizzleState={drizzleState} 
                        accountIndex={0} 
                        units="ether" 
                        precision={0} />
                <h2>Active Account with Custom Rendered Component</h2>
                            <AccountData
                              drizzle={drizzle}
                              drizzleState={drizzleState}
                              accountIndex={0}
                              units="ether"
                              precision={3}
                              render={({ address, balance, units }) => (
                                <div>
                                  <div>My Address: <span style={{ color: "red" }}>{address}</span></div>
                                  <div>My Ether: <span style={{ color: "red" }}>{balance}</span> {units}</div>
                                </div>
                              )}
                            />

                          <div className="section">
                            <h2>TrsrToken</h2>
                            <p>
                              This shows a simple ContractData component with no arguments,
                              along with a form to set its value.
                            </p>
                            <p>
                              <strong>Total Supply of Tokens: </strong>
                              <ContractData
                                drizzle={drizzle}
                                drizzleState={drizzleState}
                                contract="TrsrToken"
                                method="balanceOf"
                                methodArgs={[accounts[0]]}
                              />
                            </p>
                            <ContractForm
                              drizzle={drizzle}
                              drizzleState={drizzleState}
                              contract="TrsrToken"
                              method="name"
                            />
                            <p>
                              <strong>Symbol: </strong>
                              <ContractData
                                drizzle={drizzle}
                                drizzleState={drizzleState}
                                contract="TrsrToken"
                                method="symbol"
                              />
                            </p>
                            <ContractForm
                              drizzle={drizzle}
                              drizzleState={drizzleState}
                              contract="TrsrToken"
                              method="decimals"
                            />

                            <h2>TrsrToken with Custom Rendering</h2>
                            <p>
                              This is the same contract as above, but here we customize the ContractForm's rendered component's style.
                            </p>
                            <ContractForm
                              drizzle={drizzle}
                              drizzleState={drizzleState}
                              contract="TrsrToken"
                              method="approve"
                              render={({ inputs, inputTypes, state, handleInputChange, handleSubmit }) => (
                                <form onSubmit={handleSubmit}>
                                  {inputs.map((input, index) => (
                                    <input
                                      style={{ fontSize: 30 }}
                                      key={input.name}
                                      type={inputTypes[index]}
                                      name={input.name}
                                      value={state[input.name]}
                                      placeholder={input.name}
                                      onChange={handleInputChange}
                                    />
                                  ))}
                                  <button
                                    key="submit"
                                    type="button"
                                    onClick={handleSubmit}
                                    style={{ fontSize: 30 }}
                                  >
                                    Submit Big
                                  </button>
                                </form>

                              )}
                            />
                          </div>
                          <div className="section">
            <h2>TrsrToken</h2>
            <p>
              Here we have a form with custom, friendly labels. Also note the
              token symbol will not display a loading indicator. We've
              suppressed it with the <code>hideIndicator</code> prop because we
              know this variable is constant.
            </p>
            <p>
              <strong>Total Supply: </strong>
              <ContractData
                drizzle={drizzle}
                drizzleState={drizzleState}
                contract="TrsrToken"
                method="totalSupply"
                methodArgs={[{ from: accounts[0] }]}
              />{" "}
              <ContractData
                drizzle={drizzle}
                drizzleState={drizzleState}
                contract="TrsrToken"
                method="symbol"
                hideIndicator
              />
            </p>
            <p>
              <strong>My Balance: </strong>
              <ContractData
                drizzle={drizzle}
                drizzleState={drizzleState}
                contract="TrsrToken"
                method="balanceOf"
                methodArgs={[accounts[0]]}
              />{" "}
                <ContractData
                  drizzle={drizzle}
                  drizzleState={drizzleState}
                  contract="TrsrToken"
                  method="symbol"
                  hideIndicator
                />
            </p>
            <MyDrizzleApp drizzle={drizzle} drizzleState={drizzleState} />
          </div>
        </div>
      </div>
    </div>
    </div>




<nav className="navbar navbar-inverse">
        <div className="container-fluid">
          <div className="navbar-header">
            <a className="navbar-brand" href="#">WebSiteName</a>
          </div>
          <ul className="nav navbar-nav">
            <li className="active"><a href="#">Home</a></li>
            <li><a href="#">Page 1</a></li>
            <li><a href="#">Page 2</a></li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li><a href="#"><span className="glyphicon glyphicon-user"></span> Sign Up</a></li>
            <li><a href="#"><span className="glyphicon glyphicon-log-in"></span> Login</a></li>
          </ul>
        </div>
      </nav>

clean orange center
        <div>
          <nav className="nav navbar-lg" id="mainNav">
            <a className="navbar-brand-header" href="#">Treasure</a>
          </nav>
          <ul className="nav navbar-n ml-auto justify-content-center" id="mainNav">
            <li className="nav-item">
              <a className="nav-link" href="#">Code</a>
            </li>
              <li className="nav-item">
                <a className="nav-link" href="#">Token</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">About</a>
              </li>
          </ul>
        </div>

left dark nice
<nav class="navbar navbar-expand-md" id="mainNav">
        <a class="navbar-brand" href="#">Treasure</a>
        <Navbar.Collapse id="basic-navbar-nav">
        <ul class="navbar-nav mr-auto mt-2 mt-lg-0">
          <li class="nav-item">
            <a class="nav-link" href="#">About</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Code</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Token</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" href="#">Contact</a>
          </li>
        </ul>
        </Navbar.Collapse>
      </nav>

navbar drop down
<NavDropdown title="Dropdown" id="collasible-nav-dropdown">
            <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.2">Another action</NavDropdown.Item>
            <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#action/3.4">Separated link</NavDropdown.Item>
          </NavDropdown>

app.js grid
<div>
            <div className="container-fluid">
              <div className="row">
                <div className="col-lg text-center">
                  <h1>Col1</h1>
                </div>
                <div className="col-lg text-center">
                  <h1>Col2</h1>
                </div>
                <div className="col-lg text-center">
                  <h1>Col3</h1>
                </div>
              </div>
            </div>
          </div>

Balance stuff
                  <div>
                    <h1>Balance</h1>
                    <p>Check the token balance of an Ethereum address.</p>
                    <ContractForm
                      drizzle={drizzle}
                      drizzleState={drizzleState}
                      contract="TrsrToken"
                      method="balanceOf"
                      render={({ inputs, inputTypes, state, handleInputChange, handleSubmit }) => (
                        <form onSubmit={handleSubmit} className="form-inline">
                          {inputs.map((input, index) => (
                            <div className="form-group">
                              <input
                                className="form-control mb-2 mr-sm-2"
                                style={{ fontSize: 30 }}
                                key={input.name}
                                type={inputTypes[index]}
                                name={input.name}
                                value={state[input.name]}
                                placeholder={input.name}
                                onChange={handleInputChange}
                              />
                            </div>
                          ))}
                            <button
                              key="submit"
                              type="button"
                              className="btn btn-primary btn-dark mb-2"
                              onClick={handleSubmit}
                              style={{ fontSize: 30 }}
                            >Balance
                            </button>
                        </form>
                      )}
                    />
                    <div>