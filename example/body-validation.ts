/**
 * example to integrate Third party library to validate json body
 * @see https://deno.land/x/validasaur@v0.15.0
 */
import {EMethod, Api, Route, BadRequestError, IContext} from '../mod.ts';

// create an api instance
const api = new Api({port: 8080});

// import some inbuild routes and pipes
import statusRoute from '../src/presets/routes/status.ts';
import jsonBodyPipe from '../src/presets/pipes/body/json-body.pipe.ts';

// add basic status route
api.addRoute(statusRoute);

/**
 * use validasaur library for validation of body
 */
import { validate, required, isNumber, flattenMessages, ValidationRules } from "https://deno.land/x/validasaur/mod.ts";

const schema : ValidationRules = {
    name: required,
    age: [required, isNumber]
};


/**
 * create custom factory pipe using as general validation process
 *
 * @param schema
 */
function bodyValidationPipe(schema: ValidationRules) {
    return async ({ state, response }: IContext) => {
        const body = state.get('body'); // will be set by jsonBodyPipe

        const [ passes, errors ] = await validate(body, schema);

        if (!passes) {
            // add validation property for more details
            // is use the flattenMessages method to simplify my response
            response.body = {
                validation: await flattenMessages(errors)
            };

            // throw bad request error to break the pipes and show json data with error information
            throw new BadRequestError('Invalid model', 400);
        }
    }
}


////// add example route
api
    .addRoute(
        new Route(EMethod.POST, '/')
            // first step have to transform request data to json body by using internal pipe
            .addPipe(jsonBodyPipe)

            // add your validation pipe
            .addPipe(bodyValidationPipe(schema))

            .addPipe(({response, state }) => {
                response.body = {
                    answer: 'all valid',
                    input: state.get('body')
                }
            })
    )


// start server
console.log(`Start server localhost:${api.serverConfig.port}`);
await api.listen();

/**
now you can test with a curl request

curl --location --request POST 'http://localhost:8080/' \
 --header 'Content-Type: application/json' \
 --data-raw '{
    "name": "deno",
    "age": 12
}'
 */