﻿import * as React from "react";

import { Label, Icon, Button, Segment, Header, Input, Grid, Dimmer, Loader, Message, TextArea } from 'semantic-ui-react';
import Draft, { htmlToDraft, draftToHtml, EmptyState, rawToDraft, draftToRaw, draftStateToHTML }
    from 'react-wysiwyg-typescript';
import { EditorState, convertToRaw } from 'draft-js';
import Config from '../../ApiConfig/Config';
import { ArticleCreate, ArticleView, Image } from '../model/Article';
import ArticleViewModel from '../components/ArticleViewModel';

export default class ArticleAdd extends React.Component<{}, {}>
{
    config = new Config();

    state = {
        editorState: EditorState.createEmpty(),
        title: "",
        urlTitle: "",
        file: {
            name: ""
        },
        loaderArticles: false,
        sendStatus: 0,
        editText: ""
    }

    constructor(props: any) {
        super(props);

        this.addArticle.bind(this);
        this.handleInput.bind(this);
    }

    public handleInput(event: any) {
        this.setState({
            [event.target.name]: event.target.value
        });
    }

    public addArticle() {
        let context = this;

        let article = new ArticleCreate(
            this.state.title,
            draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
            this.state.urlTitle
        );
        context.setState({
            loaderArticles: true
        })

        article.Images.push(new Image(this.state.file.name));

        this.config.post("Article/Add", article)
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                context.setState({
                    loaderArticles: false
                })

                if (response.code != 200) {
                    context.setState({
                        sendStatus: -1
                    })
                    return;
                }
                    
                context.setState({
                    sendStatus: 1
                })
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    public addImg(file: File) {
        let context = this;

        var f = new FormData();
        f.append("File", file);

        this.config.postWithMultiple("File/Upload/NewArticle", f)
            .then(function (response) {
                return response.json();
            })
            .then(function (response) {
                if (response.code != 200) {
                    return;
                }

                context.setState({
                    file: {
                        name: response.responseData.source
                    }
                });
            })
            .catch(function (err) {
                console.log(err);
            });
    }

    render() {
        const { editorState } = this.state;

        return (
            <Segment stacked>
                {
                    this.state.loaderArticles == true ? (
                        <Dimmer active inverted>
                            <Loader size='medium'>Ładowanie</Loader>
                        </Dimmer>
                    ) : ''
                }

                {
                    this.state.sendStatus == 1 ? (
                        <Message positive>
                            <Message.Header>Pomyślnie dodano artkoł</Message.Header>
                        </Message>
                    ) : this.state.sendStatus == -1 ? (
                        <Message negative>
                            <Message.Header>Błąd podczas akcji</Message.Header>
                        </Message>
                    ) : ''
                }

                <Grid columns={3} stackable={true} textAlign={"left"}>
                    <Grid.Row>
                        <Grid.Column>
                            <Input name='title' label="Tytul: " value={this.state.title} onChange={this.handleInput.bind(this)} placeholder='Tytuł' />
                        </Grid.Column>
                        <Grid.Column>
                            <label htmlFor={'img'} className="ui icon button">
                                <i className="upload icon"></i>
                                Zdjęcie
                            </label>
                            <input type="file" id={'img'}
                                style={{ display: "none" }}
                                onChange={(input) => {
                                    this.addImg(input.target.files[0]);
                                }}
                            />

                            <Label>
                                {this.state.file.name}
                            </Label>
                        </Grid.Column>
                        <Grid.Column>
                            <Input name='urlTitle' label="Ulr: " value={this.state.urlTitle} onChange={this.handleInput.bind(this)} placeholder='Tytuł' />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <Draft
                    editorState={editorState}
                    onEditorStateChange={(editorState) => { this.setState({ editorState, editText: draftToHtml(convertToRaw(editorState.getCurrentContent())) }) }}
                />

                <div></div>

                <TextArea value={this.state.editText}
                    onChange={(value) => {
                        this.setState({
                            editText: value.currentTarget.value
                        });
                    }}
                />
                <div></div>
                <Button content="Edytuj" onClick={() => {
                    this.setState({
                        editorState: htmlToDraft(this.state.editText)
                    })
                }} />

                <div></div>
                <hr/>

                <ArticleViewModel article={new ArticleView(
                    0,
                    this.state.title,
                    draftToHtml(convertToRaw(this.state.editorState.getCurrentContent())),
                    null,
                    Config.API_FILE + this.state.file.name,
                    this.state.urlTitle
                )} />
                <Button primary onClick={this.addArticle.bind(this)}>
                    Dodaj
                </Button>
            </Segment>
        );
    }
}