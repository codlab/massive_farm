import request, {UriOptions} from "request";

type Options = (request.UriOptions & request.CoreOptions) | (request.UrlOptions & request.CoreOptions);

const precall = (url: string, method: string, qs?: any, json?: {}): Promise<{}|undefined> => {
  var options: Options = {
    method: method,
    uri: url,
    headers: {"Content-Type": "application/json"},
  }
  if(json) options.json = json || true;
  if(qs) options.qs = qs || undefined;

  return new Promise((resolve, reject) => {
    request(options, (e, resp, body) => {
      try {
        if(typeof body == "string") {
          body = JSON.parse(body);
        }
      }catch(e){
        //error ?
      }
      if(body && !body.error && resp.code != 401) resolve(body);
      else reject({error : body ? body.error : "invalid result"});
    });
  });
}

export default {
  get: (url: string, params?: any) => precall(url, "GET", params, undefined),
  post: (url: string, params?: any) => precall(url, "POST", undefined, params)
};
