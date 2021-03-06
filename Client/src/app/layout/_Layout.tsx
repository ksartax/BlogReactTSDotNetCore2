﻿import * as React from "react";
import { NavLink,  Router ,Route, Switch} from 'react-router-dom'
import { Container, Grid, Menu, Header, Input, Search } from 'semantic-ui-react'
import createBrowserHistory from 'history/createBrowserHistory';
import * as _ from 'lodash';

import Post from '../model/Post';
import Category from '../model/Category';

import Home from '../view/Home';
import About from '../view/About';
import PostView from '../view/PostView';
import Footer from "../view/basic/Footer";
import NotFound from "../view/basic/NotFound";
import Config from '../ApiConfig/Config';

export default class Layout extends React.Component {
    public config = new Config();

    state = {
        activeLink: window.location.pathname,
        categorys: Array<Category>()
    };

    constructor(props: any) {
        super(props);

        this.changeLinkActive.bind(this);
    }

    changeLinkActive = (name: string) => {
        this.setState({
            activeLink: name
        });
    };

    render() {
        const history = createBrowserHistory()

        return (
            <Router history={history}>
                <Grid columns={2} stackable divided={false} style={{ marginTop: '0px' }}>
                        <Grid.Column computer='4' style={{
                            backgroundImage: "url('http://2.bp.blogspot.com/-hZXRNdtcHBM/WMVliQpFi-I/AAAAAAAABrU/C3LmH9wsQdwF3b7obdz3ttAky2m0U0bIQCK4B/s0/compressed+bg.jpg')",
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center center',
                            opacity: '0.8'
                        }}>
                        <div>
                            <Menu vertical fluid>
                                <NavLink exact activeClassName='activeL' to="/">
                                    <Menu.Item link >
                                        Strona główna
                                    </Menu.Item>
                                </NavLink>

                                <NavLink activeClassName='activeL' to="/o-mnie">
                                    <Menu.Item link >
                                        O mnie
                                    </Menu.Item>
                                </NavLink>
                            </Menu>

                            <NavCategory />
                            <SearchComponent history={history}/>

                        </div>
                        </Grid.Column>

                        <Grid.Column computer='12' style={{
                            overflow: 'scroll',
                            height: '100vh',
                            overflowX: 'hidden'
                        }} id='main-div'>
                        <div>
                            <ScrollToTop>
                                <Switch>
                                    <Route exact path="/" component={Home} />
                                    <Route exact path="/o-mnie" component={About} />
                                    <Route exact path="/view/:use" component={PostView} />
                                    <Route exact path="/category/:url" component={Home} />
                                    <Route exact component={NotFound} />
                                </Switch>
                            </ScrollToTop>
                         </div>
                            <div>
                                <Footer />
                            </div>
                        </Grid.Column>
                    </Grid>
                </Router>
        );
    }
}

class ScrollToTop extends React.Component {
    componentDidUpdate(prevProps: any) {
        var myDiv = document.getElementById('main-div');
        if (myDiv != null) {
            myDiv.scrollTop = 0;
        }
    }

    render() {
        return this.props.children
    }
}

class NavCategory extends React.Component<{}, {}> {
    public config = new Config();

    state = {
        categorys: Array<Category>()
    };

    componentDidMount() {
        this.loadCategory();
    }

    public loadCategory() {
        let context = this;

        this.config.get("Category?page=1")
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                if (response.code != 200) {
                    return;
                }

                let _categories = new Array<Category>();
                let responseData = response.responseData;
                for (let po of responseData.items) {
                    _categories.push(new Category(
                        po.id,
                        po.title,
                        po.urlTitle
                    ));
                }

                context.setState({
                    categorys: _categories
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    render() {
       return <Menu vertical fluid>
            {
                this.state.categorys.map((value) => (
                   <NavLink activeClassName='activeL' to={'/category/' + value.UrlTitle} >
                        <Menu.Item link >
                            {value.Name}
                        </Menu.Item>
                    </NavLink>
                )
            )}
        </Menu>
    }
}

class SearchComponent extends React.Component<{ history: any }, {}> {
    public config = new Config();

    state = {
        isLoading: false,
        value: '',
        results: [],
        timeout: 0
    }

    public searchPosts() {
        let context = this;
        let _search = this.state.value;

        window.clearTimeout(context.state.timeout);
        var timeoutHandle = setTimeout(function () {
            context.config.get("Article/s/?s=" + _search)
                .then(function (response) {
                    return response.json();
                })
                .then(function (response) {
                    if (response.code != 200) {
                        return;
                    }

                    let _posts = new Array();
                    let responseData = response.responseData;
                    for (let po of responseData) {
                        _posts.push({
                            "title": po.title,
                            "image": Config.API_FILE + po.image.path,
                            "urlTitle": po.titleUrl
                        });
                    }

                    context.setState({
                        results: _posts
                    });
                })
                .catch(function (err) {
                    console.log(err);
                });
        }, 2000);

        console.log(this.state.results);

        this.setState({
            timeout: timeoutHandle 
        });
    }

    handleResult = (value: any) => {
        this.setState({ value: value.currentTarget.value });

        this.searchPosts();
    };

    handleResultSelect = (e: any) => {
        this.props.history.push("/view/" + e.currentTarget.attributes.urltitle.value);
    };

    render() {
        const { isLoading, value, results } = this.state

        return (
            <Grid>
                <Grid.Column width={8}>
                    <Search
                        loading={isLoading}
                        onResultSelect={this.handleResultSelect}
                        onSearchChange={this.handleResult}
                        results={results}
                        value={value}
                        {...this.props}
                    />
                </Grid.Column>
            </Grid>
       );
    }
}