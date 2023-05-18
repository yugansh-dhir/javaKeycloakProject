import React from 'react';
import ReactDOM from 'react-dom';
import * as Keycloak from 'keycloak-js'
import $ from "jQuery";



//8180 to 8080 for keycloak
//keycloak init options
let initOptions = {
    url: 'http://localhost:8080/', 
    realm: 'shopping-hub', 
    clientId: 'react-login-client', 
    onLoad: 'login-required'
}




let keycloak = Keycloak(initOptions);

keycloak.init({ onLoad: initOptions.onLoad }).success((auth) => {

    if (!auth) {
        window.location.reload();
    } else {
        console.info("Authenticated");
    }

    localStorage.setItem("bearer-token", keycloak.token);
    localStorage.setItem("refresh-token", keycloak.refreshToken);
    console.log(keycloak.token);

    setTimeout(() => {
        keycloak.updateToken(70).success((refreshed) => {
            if (refreshed) {
                console.debug('Token refreshed' + refreshed);
            } else {
                console.warn('Token not refreshed, valid for '
                    + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
            }
        }).error(() => {
            console.error('Failed to refresh token');
        });


    }, 60000)

}).error(() => {
    console.error("Authenticated Failed");
});



function LogOut(){
    const logout = ()=>{
        keycloak.logout();
    };

    return (
     <>
        <button type="button" class="btn btn-danger" onClick={logout}>
          Logout
        </button>
    </>

    );
}

ReactDOM.render(<LogOut />, document.getElementById("logoutBtn"));


 //8123 from 8080 for react server

function CheckRoles() {
  const check = () => {
    $.ajax({
      type: "GET",
     
      url: "http://localhost:8123/check/admin",
      headers : {
         'Authorization': 'Bearer ' + localStorage.getItem("bearer-token")
      },
      success: function (data1) {
        document.getElementById("admin").innerHTML = data1;
      },
      error: function (error) {
        document.getElementById("admin").innerHTML = "You don't have admin access";
      }
    });

    $.ajax({
      type: "GET",
      url: "http://localhost:8123/check/customer",
      headers : {
         'Authorization': 'Bearer ' + localStorage.getItem("bearer-token")
      },
      success: function (data2) {
        document.getElementById("cust").innerHTML = data2;
      },
      error: function (error) {
        document.getElementById("cust").innerHTML = "You don't have customer privileges";
      }
    });


  };

  return (
    <>
    <h1>Privileges or Access</h1>
      <p> Check if you have Admin privileges or Customer privileges
      </p>
      <button type="button" class="btn btn-primary" onClick={check} >
        Check 
      </button>
      <p id="admin"> </p>
      <p id="cust"> </p>
    </>
  );
}
ReactDOM.render(<CheckRoles />, document.getElementById("root"));


